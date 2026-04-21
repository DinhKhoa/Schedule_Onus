const mongoose = require('mongoose');

/**
 * NgayGioTap — Bảng trung gian lưu trạng thái của từng cặp (Ngày + Khung giờ)
 * Chỉ tồn tại record khi trạng thái được ghi đè (khác mặc định)
 * Nếu không có record → khung giờ đó trong ngày đó ở trạng thái mặc định của GioTap
 */
const ngayGioTapSchema = new mongoose.Schema({
  ngayTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NgayTap',
    required: true
  },
  gioTapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GioTap',
    required: true
  },
  trangThai: {
    type: String,
    enum: ['HoatDong', 'NgungHoatDong'],
    default: 'NgungHoatDong'  // Record chỉ tạo khi override, thường là để tắt
  }
}, {
  timestamps: true
});

// Mỗi cặp (ngày + giờ) chỉ có 1 record
ngayGioTapSchema.index({ ngayTapId: 1, gioTapId: 1 }, { unique: true });

module.exports = mongoose.model('NgayGioTap', ngayGioTapSchema, 'NgayGioTap');
