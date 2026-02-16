const mongoose = require('mongoose');

const ngayTapSchema = new mongoose.Schema({
  ngay: {
    type: Date,
    required: true
  },
  ptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trangThai: {
    type: String,
    enum: ['HoatDong', 'Tat'],
    default: 'HoatDong'
  }
}, {
  timestamps: true
});

ngayTapSchema.index({ ngay: 1, ptId: 1 }, { unique: true });

module.exports = mongoose.model('NgayTap', ngayTapSchema, 'NgayTap');
