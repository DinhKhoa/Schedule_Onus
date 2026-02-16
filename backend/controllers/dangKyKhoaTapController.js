const DangKyKhoaTap = require('../models/DangKyKhoaTap');
const KhoaTap = require('../models/KhoaTap');
const User = require('../models/User');

// GET /api/dang-ky-khoa-tap
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const enrollments = await DangKyKhoaTap.find()
      .populate('hoiVienId', 'hoTen soDienThoai')
      .populate('khoaTapId', 'tenKhoaTap soBuoi')
      .populate('ptId', 'hoTen')
      .sort({ ngayDangKy: -1 });

    // Client-side search filtering after population
    let result = enrollments;
    if (search) {
      const s = search.toLowerCase();
      result = enrollments.filter(e =>
        e.hoiVienId?.hoTen?.toLowerCase().includes(s) ||
        e.khoaTapId?.tenKhoaTap?.toLowerCase().includes(s)
      );
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/dang-ky-khoa-tap
exports.create = async (req, res, next) => {
  try {
    const { hoiVienId, khoaTapId, ptId, ngayDangKy } = req.body;

    // Validate required fields
    if (!hoiVienId) return res.status(400).json({ error: 'Hội viên là bắt buộc' });
    if (!khoaTapId) return res.status(400).json({ error: 'Khóa tập là bắt buộc' });
    if (!ptId) return res.status(400).json({ error: 'PT phụ trách là bắt buộc' });

    // Validate references exist
    const member = await User.findById(hoiVienId);
    if (!member || member.vaiTro !== 'HOIVIEN') {
      return res.status(400).json({ error: 'Hội viên không hợp lệ' });
    }

    const pt = await User.findById(ptId);
    if (!pt || pt.vaiTro !== 'PT') {
      return res.status(400).json({ error: 'PT không hợp lệ' });
    }

    const course = await KhoaTap.findById(khoaTapId);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });

    // Check duplicate enrollment (same member + same course + same PT)
    const existingEnrollment = await DangKyKhoaTap.findOne({
      hoiVienId, khoaTapId, ptId, soBuoiConLai: { $gt: 0 }
    });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Hội viên đã đăng ký khóa tập này với PT này và vẫn còn buổi tập' });
    }

    const enrollment = await DangKyKhoaTap.create({
      hoiVienId, khoaTapId, ptId,
      ngayDangKy: ngayDangKy || Date.now(),
      soBuoiConLai: course.soBuoi
    });

    const populated = await enrollment.populate([
      { path: 'hoiVienId', select: 'hoTen' },
      { path: 'khoaTapId', select: 'tenKhoaTap soBuoi' },
      { path: 'ptId', select: 'hoTen' }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/dang-ky-khoa-tap/:id
exports.remove = async (req, res, next) => {
  try {
    const enrollment = await DangKyKhoaTap.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ error: 'Không tìm thấy đăng ký' });
    res.json({ message: 'Xóa đăng ký thành công' });
  } catch (error) {
    next(error);
  }
};
