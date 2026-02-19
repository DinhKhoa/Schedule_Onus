const NgayTap = require('../models/NgayTap');

// GET /api/ngay-tap
exports.getAll = async (req, res, next) => {
  try {
    const { ptId, ngay } = req.query;
    const filter = {};
    if (ptId) filter.ptId = ptId;
    if (ngay) {
      const start = new Date(ngay);
      start.setHours(0, 0, 0, 0);
      const end = new Date(ngay);
      end.setHours(23, 59, 59, 999);
      filter.ngay = { $gte: start, $lte: end };
    }

    const days = await NgayTap.find(filter).sort({ ngay: -1 });
    res.json(days);
  } catch (error) {
    next(error);
  }
};

// POST /api/ngay-tap
exports.create = async (req, res, next) => {
  try {
    const day = await NgayTap.create(req.body);
    res.status(201).json(day);
  } catch (error) {
    next(error);
  }
};

// PUT /api/ngay-tap/:id
exports.update = async (req, res, next) => {
  try {
    const day = await NgayTap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!day) return res.status(404).json({ error: 'Không tìm thấy ngày tập' });
    res.json(day);
  } catch (error) {
    next(error);
  }
};
