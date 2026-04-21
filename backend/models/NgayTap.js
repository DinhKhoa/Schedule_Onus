const mongoose = require('mongoose');

const ngayTapSchema = new mongoose.Schema({
  ngay: {
    type: Date,
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

ngayTapSchema.index({ ngay: 1 }, { unique: true });

module.exports = mongoose.model('NgayTap', ngayTapSchema, 'NgayTap');
