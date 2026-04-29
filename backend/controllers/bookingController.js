const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Enrollment = require('../models/Enrollment');
const TrainingDate = require('../models/TrainingDate');
const bookingService = require('../services/bookingService');

// GET /api/booking
exports.getAll = async (req, res, next) => {
  try {
    const { memberId, trainerId } = req.query;
    const filter = {};
    const { role, id } = req.user;

    let enforcedMemberId = memberId;
    let enforcedTrainerId = trainerId;
    if (role === 'MEMBER') {
      enforcedMemberId = id;
      enforcedTrainerId = undefined;
    }
    if (role === 'TRAINER') {
      enforcedTrainerId = id;
      enforcedMemberId = undefined;
    }

    if (enforcedMemberId || enforcedTrainerId) {
      const enrollmentFilter = {};
      if (enforcedMemberId) enrollmentFilter.memberId = enforcedMemberId;
      if (enforcedTrainerId) enrollmentFilter.trainerId = enforcedTrainerId;
      const enrollments = await Enrollment.find(enrollmentFilter).select('_id');
      filter.enrollmentId = { $in: enrollments.map(e => e._id) };
    }

    if (req.user && req.user.role === 'MEMBER') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const futureDays = await TrainingDate.find({ date: { $gte: today, $lte: nextWeek } }).select('_id');
      if (filter.trainingDateId) {
        filter.trainingDateId.$in = filter.trainingDateId.$in.filter(id => futureDays.some(d => d._id.equals(id)));
      } else {
        filter.trainingDateId = { $in: futureDays.map(d => d._id) };
      }
    }

    const bookings = await Booking.find(filter)
      .populate('timeSlotId')
      .populate('trainingDateId')
      .populate({
        path: 'enrollmentId',
        populate: [
          { path: 'memberId', select: 'fullName phoneNumber' },
          { path: 'trainerId', select: 'fullName' },
          { path: 'packageId' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// POST /api/booking — Book a session
exports.create = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      // Always trust authenticated user identity instead of client-provided memberId
      memberId: req.user.id
    };
    const result = await bookingService.bookSession(payload, req.app.get('io'));
    res.status(201).json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// PUT /api/booking/:id/cancel — Cancel a booking
exports.cancel = async (req, res, next) => {
  try {
    const result = await bookingService.cancelSession(req.params.id, req.app.get('io'));
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

// PUT /api/booking/:id/complete — PT marks session as complete
exports.complete = async (req, res, next) => {
  try {
    const result = await bookingService.completeSession(req.params.id, req.app.get('io'), req.user.id);
    res.json(result);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};
