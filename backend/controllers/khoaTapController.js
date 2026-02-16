const KhoaTap = require('../models/KhoaTap');

// GET /api/khoa-tap
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search ? { tenKhoaTap: { $regex: search, $options: 'i' } } : {};
    const courses = await KhoaTap.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// GET /api/khoa-tap/:id
exports.getById = async (req, res, next) => {
  try {
    const course = await KhoaTap.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });
    res.json(course);
  } catch (error) {
    next(error);
  }
};

// POST /api/khoa-tap
exports.create = async (req, res, next) => {
  try {
    const { tenKhoaTap, soBuoi } = req.body;

    if (!tenKhoaTap || !tenKhoaTap.trim()) {
      return res.status(400).json({ error: 'Tên khóa tập là bắt buộc' });
    }
    if (!soBuoi || soBuoi < 1) {
      return res.status(400).json({ error: 'Số buổi phải lớn hơn 0' });
    }

    // Check duplicate name
    const existing = await KhoaTap.findOne({ tenKhoaTap: tenKhoaTap.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
    }

    const course = await KhoaTap.create({ tenKhoaTap: tenKhoaTap.trim(), soBuoi });
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
    }
    next(error);
  }
};

// PUT /api/khoa-tap/:id
exports.update = async (req, res, next) => {
  try {
    const { tenKhoaTap, soBuoi } = req.body;

    if (tenKhoaTap !== undefined && !tenKhoaTap.trim()) {
      return res.status(400).json({ error: 'Tên khóa tập không được để trống' });
    }
    if (soBuoi !== undefined && soBuoi < 1) {
      return res.status(400).json({ error: 'Số buổi phải lớn hơn 0' });
    }

    // Check duplicate name (exclude current)
    if (tenKhoaTap) {
      const existing = await KhoaTap.findOne({ tenKhoaTap: tenKhoaTap.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
      }
    }

    const course = await KhoaTap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });
    res.json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
    }
    next(error);
  }
};

// DELETE /api/khoa-tap/:id
exports.remove = async (req, res, next) => {
  try {
    const course = await KhoaTap.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });
    res.json({ message: 'Xóa khóa tập thành công' });
  } catch (error) {
    next(error);
  }
};
