const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Họ tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Họ tên không được quá 50 ký tự']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Số điện thoại phải có đúng 10 chữ số']
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  dateOfBirth: {
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
  role: {
    type: String,
    enum: ['MEMBER', 'TRAINER'],
    required: true,
    default: 'MEMBER'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema, 'Users');
