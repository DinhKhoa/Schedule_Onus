const SlotStatus = require('../models/SlotStatus');
const TimeSlot = require('../models/TimeSlot');
const TrainingDate = require('../models/TrainingDate');
const Booking = require('../models/Booking');

// GET /api/slot-status?trainingDateId=...
exports.getByTrainingDate = async (req, res, next) => {
  try {
    const { trainingDateId } = req.query;
    if (!trainingDateId) return res.status(400).json({ error: 'Thiếu trainingDateId' });
    const overrides = await SlotStatus.find({ trainingDateId });
    res.json(overrides);
  } catch (err) {
    next(err);
  }
};

// PUT /api/slot-status/toggle-slot
exports.toggleSlotForDay = async (req, res, next) => {
  try {
    const { trainingDateId, timeSlotId } = req.body;
    if (!trainingDateId || !timeSlotId) {
      return res.status(400).json({ error: 'Thiếu trainingDateId hoặc timeSlotId' });
    }

    const slot = await TimeSlot.findById(timeSlotId);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    const existing = await SlotStatus.findOne({ trainingDateId, timeSlotId });

    let effectiveStatus;

    if (existing) {
      const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
      if (newStatus === slot.status) {
        await SlotStatus.deleteOne({ _id: existing._id });
        effectiveStatus = slot.status;
      } else {
        existing.status = newStatus;
        await existing.save();
        effectiveStatus = newStatus;
      }
    } else {
      const newStatus = slot.status === 'Active' ? 'Inactive' : 'Active';
      await SlotStatus.create({ trainingDateId, timeSlotId, status: newStatus });
      effectiveStatus = newStatus;
    }

    let warning = null;
    if (effectiveStatus === 'Inactive') {
      const activeBookings = await Booking.countDocuments({
        trainingDateId,
        timeSlotId,
        status: 'Booked'
      });
      if (activeBookings > 0) {
        warning = `Có ${activeBookings} lịch tập chưa hủy vào khung giờ này. Hội viên vẫn giữ lịch nhưng không thể đặt thêm.`;
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('slotUpdated', { trainingDateId, timeSlotId, status: effectiveStatus });

    res.json({ trainingDateId, timeSlotId, status: effectiveStatus, warning });
  } catch (err) {
    next(err);
  }
};

// PUT /api/slot-status/toggle-global
exports.toggleSlotGlobal = async (req, res, next) => {
  try {
    const { timeSlotId } = req.body;
    if (!timeSlotId) return res.status(400).json({ error: 'Thiếu timeSlotId' });

    const slot = await TimeSlot.findById(timeSlotId);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });

    const newStatus = slot.status === 'Active' ? 'Inactive' : 'Active';
    slot.status = newStatus;
    await slot.save();

    await SlotStatus.deleteMany({ timeSlotId });

    let warning = null;
    if (newStatus === 'Inactive') {
      const activeBookings = await Booking.countDocuments({
        timeSlotId,
        status: 'Booked'
      });
      if (activeBookings > 0) {
        warning = `Có ${activeBookings} lịch tập chưa hủy trong khung giờ này (tất cả các ngày). Các lịch đã đặt vẫn được giữ nhưng không thể đặt thêm.`;
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('slotStatusChanged', { timeSlotId, status: newStatus });

    res.json({ timeSlotId, status: newStatus, warning });
  } catch (err) {
    next(err);
  }
};

// PUT /api/slot-status/toggle-day
exports.toggleDay = async (req, res, next) => {
  try {
    const { trainingDateId } = req.body;
    if (!trainingDateId) return res.status(400).json({ error: 'Thiếu trainingDateId' });

    const day = await TrainingDate.findById(trainingDateId);
    if (!day) return res.status(404).json({ error: 'Không tìm thấy ngày tập' });

    const newStatus = day.status === 'Active' ? 'Inactive' : 'Active';
    day.status = newStatus;
    await day.save();

    let warning = null;
    if (newStatus === 'Inactive') {
      const activeBookings = await Booking.countDocuments({
        trainingDateId,
        status: 'Booked'
      });
      if (activeBookings > 0) {
        warning = `Có ${activeBookings} lịch tập chưa hủy vào ngày này. Các lịch đã đặt vẫn được giữ nhưng không thể đặt thêm.`;
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('dayStatusChanged', { trainingDateId, status: newStatus });

    res.json({ trainingDateId, status: newStatus, warning });
  } catch (err) {
    next(err);
  }
};
