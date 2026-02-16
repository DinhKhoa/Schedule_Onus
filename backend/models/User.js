const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  hoTen: {
    type: String,
    required: true,
    trim: true
  },
  soDienThoai: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Số điện thoại phải có đúng 10 chữ số']
  },
  matKhau: {
    type: String,
    required: true
  },
  gioiTinh: {
    type: String,
    enum: ['Nam', 'Nữ'],
    required: true
  },
  ngaySinh: {
    type: Date,
    required: true
  },
  vaiTro: {
    type: String,
    enum: ['HOIVIEN', 'PT'],
    required: true,
    default: 'HOIVIEN'
  },
  trangThai: {
    type: String,
    enum: ['HoatDong', 'NgungHoatDong'],
    default: 'HoatDong'
  }
}, {
  timestamps: true
});

userSchema.index({ soDienThoai: 1 });
userSchema.index({ vaiTro: 1 });

module.exports = mongoose.model('User', userSchema, 'Users');
