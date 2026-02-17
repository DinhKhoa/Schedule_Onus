const GioTap = require('../models/GioTap');
const NgayTap = require('../models/NgayTap');
const LichTap = require('../models/LichTap');

// GET /api/gio-tap
exports.getAll = async (req, res, next) => {
  try {
    const { ngayTapId } = req.query;
    const filter = ngayTapId ? { ngayTapId } : {};
    const slots = await GioTap.find(filter).populate('ngayTapId').sort({ gioBatDau: 1 });
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

// POST /api/gio-tap
exports.create = async (req, res, next) => {
  try {
    const { gioBatDau, gioKetThuc, ngayTapId, applyToAll } = req.body;

    if (applyToAll) {
      // Get the current day to find its date
      const currentDay = await NgayTap.findById(ngayTapId);
      if (!currentDay) return res.status(404).json({ error: 'Không tìm thấy ngày tập' });

      // Find all future active days (from today onward)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDays = await NgayTap.find({ ngay: { $gte: today } });

      const created = [];
      for (const day of futureDays) {
        // Check if slot already exists for this day
        const existing = await GioTap.findOne({ ngayTapId: day._id, gioBatDau, gioKetThuc });
        if (!existing) {
          const slot = await GioTap.create({ gioBatDau, gioKetThuc, ngayTapId: day._id });
          created.push(slot);
        }
      }

      const io = req.app.get('io');
      if (io) io.emit('slotCreated', created);
      res.status(201).json(created);
    } else {
      const slot = await GioTap.create({ gioBatDau, gioKetThuc, ngayTapId });
      const io = req.app.get('io');
      if (io) io.emit('slotCreated', slot);
      res.status(201).json(slot);
    }
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

// PUT /api/gio-tap/:id/toggle — Toggle slot between Trong and Tat
exports.toggle = async (req, res, next) => {
  try {
    const slot = await GioTap.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    // Check if slot has active booking before disabling
    if (slot.trangThai === 'Trong') {
      const activeBooking = await LichTap.findOne({ gioTapId: slot._id, trangThai: 'DaDat' });
      if (activeBooking) {
        return res.status(400).json({ error: 'Không thể tắt khung giờ đã có hội viên đặt lịch' });
      }
    }

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
    const { deleteAll } = req.query;
    const slot = await GioTap.findById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    // Check for active bookings
    const activeBooking = await LichTap.findOne({ gioTapId: slot._id, trangThai: 'DaDat' });
    if (activeBooking) {
      return res.status(400).json({ error: 'Không thể xóa khung giờ đã có hội viên đặt lịch' });
    }

    if (deleteAll === 'true') {
      // Delete matching slots from all future days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDays = await NgayTap.find({ ngay: { $gte: today } });
      const dayIds = futureDays.map(d => d._id);

      // Check all matching future slots for active bookings
      const matchingSlots = await GioTap.find({
        ngayTapId: { $in: dayIds },
        gioBatDau: slot.gioBatDau,
        gioKetThuc: slot.gioKetThuc
      });

      for (const s of matchingSlots) {
        const booking = await LichTap.findOne({ gioTapId: s._id, trangThai: 'DaDat' });
        if (booking) {
          return res.status(400).json({ error: `Không thể xóa: khung giờ ${s.gioBatDau}-${s.gioKetThuc} có hội viên đã đặt lịch` });
        }
      }

      await GioTap.deleteMany({
        ngayTapId: { $in: dayIds },
        gioBatDau: slot.gioBatDau,
        gioKetThuc: slot.gioKetThuc
      });

      res.json({ message: 'Đã xóa khung giờ từ tất cả các ngày' });
    } else {
      await GioTap.findByIdAndDelete(req.params.id);
      res.json({ message: 'Xóa khung giờ thành công' });
    }
  } catch (error) {
    next(error);
  }
};
