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
  ngayTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NgayTap',
    required: true
  },
  trangThai: {
    type: String,
    enum: ['Trong', 'DaDat', 'DaHoanThanh', 'Tat'],
    default: 'Trong'
  }
}, {
  timestamps: true
});

gioTapSchema.index({ ngayTapId: 1 });

module.exports = mongoose.model('GioTap', gioTapSchema, 'GioTap');
