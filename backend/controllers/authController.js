const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

exports.login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if it's an Admin (using username instead of phoneNumber in Admin model)
    const admin = await Admin.findOne({
      username: { $regex: new RegExp(`^${phoneNumber}$`, "i") },
    });
    
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res.status(401).json({ error: "Mật khẩu không đúng" });

      const token = jwt.sign(
        { id: admin._id, role: "ADMIN", fullName: admin.fullName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );
      return res.json({
        token,
        user: { id: admin._id, fullName: admin.fullName, role: "ADMIN" },
      });
    }

    // Check if it's a regular User
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(401).json({ error: "Tài khoản không tồn tại" });
    if (user.status !== "Active")
      return res.status(403).json({ error: "Tài khoản đã bị khóa" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Mật khẩu không đúng" });

    const token = jwt.sign(
      { id: user._id, role: user.role, fullName: user.fullName, gender: user.gender },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, role: user.role, gender: user.gender },
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id, role } = req.user;

    let account;
    if (role === "ADMIN") {
      account = await Admin.findById(id);
    } else {
      account = await User.findById(id);
    }

    if (!account)
      return res.status(404).json({ error: "Tài khoản không tồn tại" });

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
    }

    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch)
      return res.status(400).json({ error: "Mật khẩu cũ không đúng" });

    account.password = await bcrypt.hash(newPassword, 10);
    await account.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};
