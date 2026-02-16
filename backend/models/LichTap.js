const mongoose = require('mongoose');

const lichTapSchema = new mongoose.Schema({
  hoiVienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  ptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

lichTapSchema.index({ hoiVienId: 1 });
lichTapSchema.index({ ptId: 1 });
lichTapSchema.index({ gioTapId: 1 });

module.exports = mongoose.model('LichTap', lichTapSchema, 'LichTap');
