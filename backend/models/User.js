const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  hoTen: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Họ tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Họ tên không được quá 50 ký tự']
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
    required: true,
    validate: {
      validator: function(v) {
        const today = new Date();
        let age = today.getFullYear() - v.getFullYear();
        const m = today.getMonth() - v.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < v.getDate())) age--;
        return age >= 18 && age <= 100;
      },
      message: 'Người dùng phải từ 18 tuổi trở lên'
    }
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
