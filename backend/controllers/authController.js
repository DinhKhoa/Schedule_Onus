const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const QuanTriVien = require("../models/QuanTriVien");

exports.login = async (req, res, next) => {
  try {
    const { soDienThoai, matKhau } = req.body;

    const admin = await QuanTriVien.findOne({
      taiKhoan: { $regex: new RegExp(`^${soDienThoai}$`, "i") },
    });
    if (admin) {
      const isMatch = await bcrypt.compare(matKhau, admin.matKhau);
      if (!isMatch)
        return res.status(401).json({ error: "Mật khẩu không đúng" });

      const token = jwt.sign(
        { id: admin._id, vaiTro: "ADMIN", hoTen: admin.hoTen },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );
      return res.json({
        token,
        user: { id: admin._id, hoTen: admin.hoTen, vaiTro: "ADMIN" },
      });
    }

    const user = await User.findOne({ soDienThoai });
    if (!user)
      return res.status(401).json({ error: "Tài khoản không tồn tại" });
    if (user.trangThai !== "HoatDong")
      return res.status(403).json({ error: "Tài khoản đã bị khóa" });

    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) return res.status(401).json({ error: "Mật khẩu không đúng" });

    const token = jwt.sign(
      { id: user._id, vaiTro: user.vaiTro, hoTen: user.hoTen },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    res.json({
      token,
      user: { id: user._id, hoTen: user.hoTen, vaiTro: user.vaiTro },
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    const { id, vaiTro } = req.user;

    let account;
    if (vaiTro === "ADMIN") {
      account = await QuanTriVien.findById(id);
    } else {
      account = await User.findById(id);
    }

    if (!account)
      return res.status(404).json({ error: "Tài khoản không tồn tại" });

    const isMatch = await bcrypt.compare(matKhauCu, account.matKhau);
    if (!isMatch)
      return res.status(400).json({ error: "Mật khẩu cũ không đúng" });

    account.matKhau = await bcrypt.hash(matKhauMoi, 10);
    await account.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};
