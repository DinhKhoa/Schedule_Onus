const NgayGioTap = require('../models/NgayGioTap');
const GioTap = require('../models/GioTap');
const NgayTap = require('../models/NgayTap');
const LichTap = require('../models/LichTap');

/**
 * GET /api/ngay-gio-tap?ngayTapId=...
 * Trả về tất cả các override trạng thái cho 1 ngày
 */
exports.getByNgay = async (req, res, next) => {
  try {
    const { ngayTapId } = req.query;
    if (!ngayTapId) return res.status(400).json({ error: 'Thiếu ngayTapId' });
    const overrides = await NgayGioTap.find({ ngayTapId });
    res.json(overrides);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/ngay-gio-tap/toggle-slot
 * Toggle trạng thái khung giờ cho 1 ngày cụ thể (chỉ ngày đó)
 * Body: { ngayTapId, gioTapId }
 */
exports.toggleSlotForDay = async (req, res, next) => {
  try {
    const { ngayTapId, gioTapId } = req.body;
    if (!ngayTapId || !gioTapId) {
      return res.status(400).json({ error: 'Thiếu ngayTapId hoặc gioTapId' });
    }

    // Lấy trạng thái gốc của GioTap
    const slot = await GioTap.findById(gioTapId);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    // Kiểm tra có override chưa
    const existing = await NgayGioTap.findOne({ ngayTapId, gioTapId });

    let effectiveStatus;

    if (existing) {
      // Đã có override → toggle rồi xóa nếu quay về trạng thái gốc
      const newStatus = existing.trangThai === 'HoatDong' ? 'NgungHoatDong' : 'HoatDong';
      if (newStatus === slot.trangThai) {
        // Quay về trạng thái gốc → xóa override đi
        await NgayGioTap.deleteOne({ _id: existing._id });
        effectiveStatus = slot.trangThai;
      } else {
        existing.trangThai = newStatus;
        await existing.save();
        effectiveStatus = newStatus;
      }
    } else {
      // Chưa có override → tạo mới với trạng thái ngược lại
      const newStatus = slot.trangThai === 'HoatDong' ? 'NgungHoatDong' : 'HoatDong';
      await NgayGioTap.create({ ngayTapId, gioTapId, trangThai: newStatus });
      effectiveStatus = newStatus;
    }

    // Kiểm tra nếu đang tắt → cảnh báo nếu có booking chưa hủy
    let warning = null;
    if (effectiveStatus === 'NgungHoatDong') {
      const activeBookings = await LichTap.countDocuments({
        ngayTapId,
        gioTapId,
        trangThai: 'DaDat'
      });
      if (activeBookings > 0) {
        warning = `Có ${activeBookings} lịch tập chưa hủy vào khung giờ này. Hội viên vẫn giữ lịch nhưng không thể đặt thêm.`;
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('slotUpdated', { ngayTapId, gioTapId, trangThai: effectiveStatus });

    res.json({ ngayTapId, gioTapId, trangThai: effectiveStatus, warning });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/ngay-gio-tap/toggle-global
 * Toggle trạng thái khung giờ cho toàn bộ các ngày (global)
 * Body: { gioTapId }
 */
exports.toggleSlotGlobal = async (req, res, next) => {
  try {
    const { gioTapId } = req.body;
    if (!gioTapId) return res.status(400).json({ error: 'Thiếu gioTapId' });

    const slot = await GioTap.findById(gioTapId);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    const newStatus = slot.trangThai === 'HoatDong' ? 'NgungHoatDong' : 'HoatDong';
    slot.trangThai = newStatus;
    await slot.save();

    // Xóa toàn bộ override riêng lẻ (vì global đã thay đổi)
    await NgayGioTap.deleteMany({ gioTapId });

    // Cảnh báo nếu đang tắt và có booking
    let warning = null;
    if (newStatus === 'NgungHoatDong') {
      const activeBookings = await LichTap.countDocuments({
        gioTapId,
        trangThai: 'DaDat'
      });
      if (activeBookings > 0) {
        warning = `Có ${activeBookings} lịch tập chưa hủy trong khung giờ này (tất cả các ngày). Các lịch đã đặt vẫn được giữ nhưng không thể đặt thêm.`;
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('slotStatusChanged', { gioTapId, trangThai: newStatus });

    res.json({ gioTapId, trangThai: newStatus, warning });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/ngay-gio-tap/toggle-day
 * Toggle trạng thái cả 1 ngày (tắt/bật toàn bộ khung giờ trong ngày đó)
 * Body: { ngayTapId }
 */
exports.toggleDay = async (req, res, next) => {
  try {
    const { ngayTapId } = req.body;
    if (!ngayTapId) return res.status(400).json({ error: 'Thiếu ngayTapId' });

    const day = await NgayTap.findById(ngayTapId);
    if (!day) return res.status(404).json({ error: 'Không tìm thấy ngày tập' });

    const newStatus = day.trangThai === 'HoatDong' ? 'NgungHoatDong' : 'HoatDong';
    day.trangThai = newStatus;
    await day.save();

    // Cảnh báo nếu đang tắt và có booking
    let warning = null;
    if (newStatus === 'NgungHoatDong') {
      const activeBookings = await LichTap.countDocuments({
        ngayTapId,
        trangThai: 'DaDat'
      });
      if (activeBookings > 0) {
        warning = `Có ${activeBookings} lịch tập chưa hủy vào ngày này. Các lịch đã đặt vẫn được giữ nhưng không thể đặt thêm.`;
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('dayStatusChanged', { ngayTapId, trangThai: newStatus });

    res.json({ ngayTapId, trangThai: newStatus, warning });
  } catch (err) {
    next(err);
  }
};
