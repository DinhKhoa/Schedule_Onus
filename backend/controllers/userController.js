const bcrypt = require('bcrypt');
const User = require('../models/User');

// GET /api/users
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { hoTen: { $regex: search, $options: 'i' } },
        { soDienThoai: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(filter).select('-matKhau').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-matKhau');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/users
exports.create = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, matKhau, gioiTinh, ngaySinh, vaiTro, trangThai } = req.body;

    // Validate phone number: exactly 10 digits
    if (!soDienThoai || !/^[0-9]{10}$/.test(soDienThoai)) {
      return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số' });
    }

    // Check duplicate phone
    const existing = await User.findOne({ soDienThoai });
    if (existing) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
    }

    // Validate required fields
    if (!hoTen || !hoTen.trim()) {
      return res.status(400).json({ error: 'Họ tên là bắt buộc' });
    }
    if (!gioiTinh || !['Nam', 'Nữ'].includes(gioiTinh)) {
      return res.status(400).json({ error: 'Giới tính phải là Nam hoặc Nữ' });
    }
    if (!ngaySinh) {
      return res.status(400).json({ error: 'Ngày sinh là bắt buộc' });
    }
    if (!vaiTro || !['HOIVIEN', 'PT'].includes(vaiTro)) {
      return res.status(400).json({ error: 'Vai trò phải là HOIVIEN hoặc PT' });
    }

    const password = matKhau || soDienThoai; // default pw = phone number
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      hoTen: hoTen.trim(),
      soDienThoai,
      matKhau: hashedPassword,
      gioiTinh,
      ngaySinh,
      vaiTro,
      trangThai: trangThai || 'HoatDong'
    });
    const { matKhau: _, ...userObj } = user.toObject();
    res.status(201).json(userObj);
  } catch (error) {
    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
    }
    next(error);
  }
};

// PUT /api/users/:id
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Validate phone if being updated
    if (updates.soDienThoai) {
      if (!/^[0-9]{10}$/.test(updates.soDienThoai)) {
        return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số' });
      }
      // Check duplicate (exclude current user)
      const existing = await User.findOne({ soDienThoai: updates.soDienThoai, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
      }
    }

    // Validate trangThai if being updated
    if (updates.trangThai && !['HoatDong', 'NgungHoatDong'].includes(updates.trangThai)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    // Handle password update
    if (updates.matKhau) {
      if (updates.matKhau.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      updates.matKhau = await bcrypt.hash(updates.matKhau, 10);
    } else {
      delete updates.matKhau;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-matKhau');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
    }
    next(error);
  }
};

// PUT /api/users/profile (Self-update)
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { hoTen, soDienThoai, gioiTinh, ngaySinh } = req.body;
    
    const updates = {};
    if (hoTen) updates.hoTen = hoTen.trim();
    if (gioiTinh) updates.gioiTinh = gioiTinh;
    if (ngaySinh) updates.ngaySinh = ngaySinh;
    
    if (soDienThoai) {
      if (!/^[0-9]{10}$/.test(soDienThoai)) {
        return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số' });
      }
      const existing = await User.findOne({ soDienThoai, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
      }
      updates.soDienThoai = soDienThoai;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-matKhau');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
    }
    next(error);
  }
};

// DELETE /api/users/:id
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json({ message: 'Xóa tài khoản thành công' });
  } catch (error) {
    next(error);
  }
};
