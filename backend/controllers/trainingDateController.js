const TrainingDate = require('../models/TrainingDate');
const { ensureNextWeekExists } = require('../services/weeklyScheduleService');

// GET /api/training-date
exports.getAll = async (req, res, next) => {
  try {
    await ensureNextWeekExists();

    const { date } = req.query;
    const filter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const days = await TrainingDate.find(filter).sort({ date: 1 });
    res.json(days);
  } catch (error) {
    next(error);
  }
};

// POST /api/training-date
exports.create = async (req, res, next) => {
  try {
    const day = await TrainingDate.create(req.body);
    res.status(201).json(day);
  } catch (error) {
    next(error);
  }
};

// PUT /api/training-date/:id
exports.update = async (req, res, next) => {
  try {
    const day = await TrainingDate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!day) return res.status(404).json({ error: 'Không tìm thấy ngày tập' });
    res.json(day);
  } catch (error) {
    next(error);
  }
};
