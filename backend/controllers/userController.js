const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// GET /api/users
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// POST /api/users
exports.create = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, password, gender, dateOfBirth, role, status } = req.body;

    // Validate phone number: exactly 10 digits
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số' });
    }

    // Check duplicate phone
    const existing = await User.findOne({ phoneNumber });
    if (existing) {
      return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
    }

    // Validate required fields
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Họ tên là bắt buộc' });
    }
    if (!gender || !['Male', 'Female'].includes(gender)) {
      return res.status(400).json({ error: 'Giới tính phải là Nam hoặc Nữ' });
    }
    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Ngày sinh là bắt buộc' });
    }
    if (!role || !['MEMBER', 'TRAINER'].includes(role)) {
      return res.status(400).json({ error: 'Vai trò phải là HOIVIEN hoặc PT' });
    }

    const pass = password || phoneNumber; // default pw = phone number
    if (pass.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      phoneNumber,
      password: hashedPassword,
      gender,
      dateOfBirth,
      role,
      status: status || 'Active'
    });
    const { password: _, ...userObj } = user.toObject();
    res.status(201).json(userObj);
  } catch (error) {
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

    if (updates.phoneNumber) {
      if (!/^[0-9]{10}$/.test(updates.phoneNumber)) {
        return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số' });
      }
      const existing = await User.findOne({ phoneNumber: updates.phoneNumber, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
      }
    }

    if (updates.status && !['Active', 'Inactive'].includes(updates.status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
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
    const { fullName, phoneNumber, gender, dateOfBirth } = req.body;
    
    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (gender) updates.gender = gender;
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    
    if (phoneNumber) {
      if (!/^[0-9]{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số' });
      }
      const existing = await User.findOne({ phoneNumber, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ error: 'Số điện thoại đã tồn tại trong hệ thống' });
      }
      updates.phoneNumber = phoneNumber;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

    // Cấp Token mới chứa thông tin mới cập nhật
    const token = jwt.sign(
      { id: user._id, role: user.role, fullName: user.fullName, gender: user.gender },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ user, token });
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
