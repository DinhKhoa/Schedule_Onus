const LichTap = require('../models/LichTap');
const GioTap = require('../models/GioTap');
const DangKyKhoaTap = require('../models/DangKyKhoaTap');
const bookingService = require('../services/bookingService');

// GET /api/lich-tap
exports.getAll = async (req, res, next) => {
  try {
    const { hoiVienId, ptId } = req.query;
    const filter = {};

    if (hoiVienId || ptId) {
      const enrollmentFilter = {};
      if (hoiVienId) enrollmentFilter.hoiVienId = hoiVienId;
      if (ptId) enrollmentFilter.ptId = ptId;
      const enrollments = await DangKyKhoaTap.find(enrollmentFilter).select('_id');
      filter.dangKyKhoaTapId = { $in: enrollments.map(e => e._id) };
    }

    const bookings = await LichTap.find(filter)
      .populate('gioTapId')
      .populate('ngayTapId')
      .populate({
        path: 'dangKyKhoaTapId',
        populate: [
          { path: 'hoiVienId', select: 'hoTen soDienThoai' },
          { path: 'ptId', select: 'hoTen' },
          { path: 'khoaTapId' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// POST /api/lich-tap — Book a session
exports.create = async (req, res, next) => {
  try {
    const result = await bookingService.bookSession(req.body, req.app.get('io'));
    res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// PUT /api/lich-tap/:id/cancel — Cancel a booking
exports.cancel = async (req, res, next) => {
  try {
    const result = await bookingService.cancelSession(req.params.id, req.app.get('io'));
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// PUT /api/lich-tap/:id/complete — PT marks session as complete
exports.complete = async (req, res, next) => {
  try {
    const result = await bookingService.completeSession(req.params.id, req.app.get('io'));
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};
