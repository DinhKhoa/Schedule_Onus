const CoursePackage = require('../models/CoursePackage');

// GET /api/course-package
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    const courses = await CoursePackage.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// GET /api/course-package/:id
exports.getById = async (req, res, next) => {
  try {
    const course = await CoursePackage.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });
    res.json(course);
  } catch (error) {
    next(error);
  }
};

// POST /api/course-package
exports.create = async (req, res, next) => {
  try {
    const { name, totalSessions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên khóa tập là bắt buộc' });
    }
    if (!totalSessions || totalSessions < 1) {
      return res.status(400).json({ error: 'Số buổi phải lớn hơn 0' });
    }

    // Check duplicate name
    const existing = await CoursePackage.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
    }

    const course = await CoursePackage.create({ name: name.trim(), totalSessions });
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
    }
    next(error);
  }
};

// PUT /api/course-package/:id
exports.update = async (req, res, next) => {
  try {
    const { name, totalSessions } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'Tên khóa tập không được để trống' });
    }
    if (totalSessions !== undefined && totalSessions < 1) {
      return res.status(400).json({ error: 'Số buổi phải lớn hơn 0' });
    }

    // Check duplicate name (exclude current)
    if (name) {
      const existing = await CoursePackage.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
      }
    }

    const course = await CoursePackage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });
    res.json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Tên khóa tập đã tồn tại' });
    }
    next(error);
  }
};

// DELETE /api/course-package/:id
exports.remove = async (req, res, next) => {
  try {
    const packageId = req.params.id;

    // Check if there are any enrollments linked to this package
    const Enrollment = require('../models/Enrollment');
    const hasEnrollments = await Enrollment.findOne({ packageId });
    if (hasEnrollments) {
      return res.status(400).json({ error: 'Không thể xóa khóa tập này vì đã có hội viên đăng ký. Vui lòng kiểm tra lại.' });
    }

    const course = await CoursePackage.findByIdAndDelete(packageId);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });
    res.json({ message: 'Xóa khóa tập thành công' });
  } catch (error) {
    next(error);
  }
};
