const mongoose = require('mongoose');

const gioTapSchema = new mongoose.Schema({
  gioBatDau: {
    type: String,
    required: true
  },
  gioKetThuc: {
    type: String,
    required: true
  },
  trangThai: {
    type: String,
    enum: ['HoatDong', 'NgungHoatDong'],
    default: 'HoatDong'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GioTap', gioTapSchema, 'GioTap');
