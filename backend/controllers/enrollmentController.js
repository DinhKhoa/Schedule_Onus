const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const CoursePackage = require('../models/CoursePackage');
const User = require('../models/User');
const Booking = require('../models/Booking');

// GET /api/enrollment
exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { id, role } = req.user;
    const filter = {};
    
    if (role === 'MEMBER') {
      try {
        filter.memberId = new mongoose.Types.ObjectId(id);
      } catch (e) {
        filter.memberId = id;
      }
    }

    const enrollments = await Enrollment.find(filter)
      .populate('memberId', 'fullName phoneNumber')
      .populate('packageId', 'name totalSessions')
      .populate('trainerId', 'fullName')
      .sort({ createdAt: -1 });

    let result = enrollments;
    if (search && role === 'ADMIN') {
      const s = search.toLowerCase();
      result = enrollments.filter(e =>
        e.memberId?.fullName?.toLowerCase().includes(s) ||
        e.packageId?.name?.toLowerCase().includes(s)
      );
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/enrollment
exports.create = async (req, res, next) => {
  try {
    const { memberId, packageId, trainerId, registrationDate } = req.body;

    if (!memberId) return res.status(400).json({ error: 'Hội viên là bắt buộc' });
    if (!packageId) return res.status(400).json({ error: 'Khóa tập là bắt buộc' });
    if (!trainerId) return res.status(400).json({ error: 'PT phụ trách là bắt buộc' });

    const member = await User.findById(memberId);
    if (!member || member.role !== 'MEMBER') {
      return res.status(400).json({ error: 'Hội viên không hợp lệ' });
    }

    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'TRAINER') {
      return res.status(400).json({ error: 'PT không hợp lệ' });
    }

    const course = await CoursePackage.findById(packageId);
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa tập' });

    const existingEnrollment = await Enrollment.findOne({
      memberId, packageId, trainerId, remainingSessions: { $gt: 0 }
    });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Hội viên đã đăng ký khóa tập này với PT này và vẫn còn buổi tập' });
    }

    const enrollment = await Enrollment.create({
      memberId, packageId, trainerId,
      registrationDate: registrationDate || Date.now(),
      totalSessions: course.totalSessions,
      remainingSessions: course.totalSessions
    });

    const populated = await enrollment.populate([
      { path: 'memberId', select: 'fullName' },
      { path: 'packageId', select: 'name totalSessions' },
      { path: 'trainerId', select: 'fullName' }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/enrollment/:id
exports.remove = async (req, res, next) => {
  try {
    const enrollmentId = req.params.id;
    
    // Check if there are any bookings linked to this enrollment
    const hasBookings = await Booking.findOne({ enrollmentId });
    if (hasBookings) {
      return res.status(400).json({ error: 'Không thể xóa gói tập đã có lịch sử tập luyện hoặc đang có lịch đặt. Vui lòng kiểm tra lại.' });
    }

    const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);
    if (!enrollment) return res.status(404).json({ error: 'Không tìm thấy đăng ký' });
    res.json({ message: 'Xóa đăng ký thành công' });
  } catch (error) {
    next(error);
  }
};
