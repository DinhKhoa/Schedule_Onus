const mongoose = require('mongoose');

const lichTapSchema = new mongoose.Schema({
  gioTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GioTap',
    required: true
  },
  ngayTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NgayTap',
    required: true
  },
  dangKyKhoaTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DangKyKhoaTap',
    required: true
  },
  trangThai: {
    type: String,
    enum: ['DaDat', 'DaHoanThanh', 'DaHuy'],
    default: 'DaDat'
  }
}, {
  timestamps: true
});

lichTapSchema.index({ dangKyKhoaTapId: 1 });
lichTapSchema.index({ gioTapId: 1, ngayTapId: 1 }, { unique: true });

module.exports = mongoose.model('LichTap', lichTapSchema, 'LichTap');
