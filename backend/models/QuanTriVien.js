const mongoose = require('mongoose');

const quanTriVienSchema = new mongoose.Schema({
  taiKhoan: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  matKhau: {
    type: String,
    required: true
  },
  hoTen: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuanTriVien', quanTriVienSchema, 'QuanTriVien');
