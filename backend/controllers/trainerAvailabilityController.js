const TrainerDayStatus = require('../models/TrainerDayStatus');
const TrainerSlotStatus = require('../models/TrainerSlotStatus');
const TrainingDate = require('../models/TrainingDate');

exports.getByDay = async (req, res, next) => {
  try {
    const { trainerId, trainingDateId } = req.query;
    if (!trainerId || !trainingDateId) {
      return res.status(400).json({ error: 'trainerId và trainingDateId là bắt buộc' });
    }

    const dayStatus = await TrainerDayStatus.findOne({ trainerId, trainingDateId });
    const slotStatuses = await TrainerSlotStatus.find({ trainerId, trainingDateId });
    const trainingDay = await TrainingDate.findById(trainingDateId).select('status');

    const effectiveDayStatus =
      trainingDay && trainingDay.status === 'Inactive'
        ? 'Unavailable'
        : (dayStatus?.status || 'Available');

    res.json({
      dayStatus: effectiveDayStatus,
      slotStatuses
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleDay = async (req, res, next) => {
  try {
    const { trainerId, trainingDateId } = req.body;
    if (!trainerId || !trainingDateId) {
      return res.status(400).json({ error: 'trainerId và trainingDateId là bắt buộc' });
    }

    const trainingDay = await TrainingDate.findById(trainingDateId).select('status');
    if (trainingDay && trainingDay.status === 'Inactive') {
      return res.status(400).json({ error: 'Ngày chung đang tắt. Không thể bật ngày riêng cho PT.' });
    }

    const existing = await TrainerDayStatus.findOne({ trainerId, trainingDateId });
    const newStatus = existing?.status === 'Unavailable' ? 'Available' : 'Unavailable';

    const saved = await TrainerDayStatus.findOneAndUpdate(
      { trainerId, trainingDateId },
      { status: newStatus },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(saved);
  } catch (error) {
    next(error);
  }
};

exports.toggleSlot = async (req, res, next) => {
  try {
    const { trainerId, trainingDateId, timeSlotId } = req.body;
    if (!trainerId || !trainingDateId || !timeSlotId) {
      return res.status(400).json({ error: 'trainerId, trainingDateId, timeSlotId là bắt buộc' });
    }

    const existing = await TrainerSlotStatus.findOne({ trainerId, trainingDateId, timeSlotId });
    const newStatus = existing?.status === 'Unavailable' ? 'Available' : 'Unavailable';

    const saved = await TrainerSlotStatus.findOneAndUpdate(
      { trainerId, trainingDateId, timeSlotId },
      { status: newStatus },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(saved);
  } catch (error) {
    next(error);
  }
};

exports.toggleSlotGlobal = async (req, res, next) => {
  try {
    const { trainerId, timeSlotId } = req.body;
    if (!trainerId || !timeSlotId) {
      return res.status(400).json({ error: 'trainerId và timeSlotId là bắt buộc' });
    }

    const existing = await TrainerSlotStatus.findOne({ trainerId, timeSlotId }).sort({ createdAt: -1 });
    const newStatus = existing?.status === 'Unavailable' ? 'Available' : 'Unavailable';

    await TrainerSlotStatus.updateMany(
      { trainerId, timeSlotId },
      { $set: { status: newStatus } }
    );

    res.json({ trainerId, timeSlotId, status: newStatus });
  } catch (error) {
    next(error);
  }
};
