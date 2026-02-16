const mongoose = require('mongoose');

const dangKyKhoaTapSchema = new mongoose.Schema({
  hoiVienId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  khoaTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KhoaTap',
    required: true
  },
  ptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngayDangKy: {
    type: Date,
    required: true,
    default: Date.now
  },
  soBuoiConLai: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

dangKyKhoaTapSchema.index({ hoiVienId: 1 });
dangKyKhoaTapSchema.index({ ptId: 1 });

module.exports = mongoose.model('DangKyKhoaTap', dangKyKhoaTapSchema, 'DangKyKhoaTap');
