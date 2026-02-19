const GioTap = require('../models/GioTap');
const NgayTap = require('../models/NgayTap');
const LichTap = require('../models/LichTap');

// GET /api/gio-tap
exports.getAll = async (req, res, next) => {
  try {
    const { ngayTapId } = req.query;
    const slots = await GioTap.find().sort({ gioBatDau: 1 });
    
    // If ngayTapId is provided, we need to check which slots are booked for that day
    if (ngayTapId) {
      const bookings = await LichTap.find({ ngayTapId, trangThai: { $ne: 'DaHuy' } }).select('gioTapId trangThai');
      
      const slotsWithStatus = slots.map(slot => {
        const booking = bookings.find(b => b.gioTapId.toString() === slot._id.toString());
        return {
          ...slot.toObject(),
          // Shift status to booked/completed based on LichTap, otherwise use base GioTap status
          trangThai: booking ? booking.trangThai : slot.trangThai
        };
      });
      return res.json(slotsWithStatus);
    }

    res.json(slots);
  } catch (error) {
    next(error);
  }
};

// POST /api/gio-tap
exports.create = async (req, res, next) => {
  try {
    const { gioBatDau, gioKetThuc } = req.body;
    const slot = await GioTap.create({ gioBatDau, gioKetThuc });
    const io = req.app.get('io');
    if (io) io.emit('slotCreated', slot);
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};

// PUT /api/gio-tap/:id
exports.update = async (req, res, next) => {
  try {
    const slot = await GioTap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    const io = req.app.get('io');
    if (io) io.emit('slotStatusChanged', slot);
    res.json(slot);
  } catch (error) {
    next(error);
  }
};

// PUT /api/gio-tap/:id/toggle
exports.toggle = async (req, res, next) => {
  try {
    const slot = await GioTap.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    slot.trangThai = slot.trangThai === 'Trong' ? 'Tat' : 'Trong';
    await slot.save();
    const io = req.app.get('io');
    if (io) io.emit('slotUpdated', slot);
    res.json(slot);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/gio-tap/:id
exports.remove = async (req, res, next) => {
  try {
    const slot = await GioTap.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    // Check for ANY active bookings across all days
    const activeBooking = await LichTap.findOne({ gioTapId: slot._id, trangThai: 'DaDat' });
    if (activeBooking) {
      return res.status(400).json({ error: 'Không thể xóa khung giờ đang có người đặt lịch' });
    }

    await GioTap.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa khung giờ thành công' });
  } catch (error) {
    next(error);
  }
};
