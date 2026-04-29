const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const SlotStatus = require('../models/SlotStatus');
const Enrollment = require('../models/Enrollment');
const TrainingDate = require('../models/TrainingDate');
const TrainerDayStatus = require('../models/TrainerDayStatus');
const TrainerSlotStatus = require('../models/TrainerSlotStatus');

/**
 * Book a session
 */
exports.bookSession = async (data, io) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { memberId, timeSlotId, trainingDateId } = data;

    // 1. Get slot and day info
    const slot = await TimeSlot.findById(timeSlotId).session(session);
    if (!slot || slot.status === 'Inactive') {
      throw { status: 400, message: 'Khung giờ không khả dụng' };
    }

    // 1b. Check per-day override (SlotStatus)
    const override = await SlotStatus.findOne({ trainingDateId, timeSlotId }).session(session);
    if (override && override.status === 'Inactive') {
      throw { status: 400, message: 'Khung giờ không khả dụng vào ngày này' };
    }

    const day = await TrainingDate.findById(trainingDateId).session(session);
    if (!day || day.status === 'Inactive') {
      throw { status: 400, message: 'Ngày tập không khả dụng' };
    }

    // 2. Prevent booking in the past
    const sessionDate = new Date(day.date);
    const [hours, minutes] = slot.startTime.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (sessionDate <= new Date()) {
      throw { status: 400, message: 'Không thể đặt khung giờ trong quá khứ' };
    }

    // 3. Find active enrollment
    console.log('DEBUG: Booking for memberId:', memberId);
    let memberObjectId;
    try {
      memberObjectId = new mongoose.Types.ObjectId(memberId);
    } catch (e) {
      memberObjectId = memberId;
    }

    const enrollment = await Enrollment.findOne({
      memberId: memberObjectId,
      remainingSessions: { $gt: 0 }
    }).sort({ registrationDate: 1, createdAt: 1 }).session(session);

    if (!enrollment) {
      const allEnrollments = await Enrollment.find({ memberId: memberId }).session(session);
      console.log('DEBUG: No active enrollment found. Total enrollments found for this ID:', allEnrollments.length);
      if (allEnrollments.length > 0) {
        console.log('DEBUG: First enrollment details:', {
          remaining: allEnrollments[0].remainingSessions,
          memberIdInDB: allEnrollments[0].memberId
        });
      }
      throw { status: 400, message: 'Bạn không còn buổi tập khả dụng. Vui lòng đăng ký khóa tập mới.' };
    }

    // 3b. NEW: Check if member has enough remaining sessions after accounting for pending bookings
    const pendingBookingsCount = await Booking.countDocuments({
      enrollmentId: enrollment._id,
      status: { $in: ['PendingTrainerConfirm', 'Booked'] }
    }).session(session);

    if (enrollment.remainingSessions <= pendingBookingsCount) {
      throw { status: 400, message: 'Số buổi còn lại không đủ (đã tính các lịch đặt chờ tập). Vui lòng kiểm tra lại.' };
    }

    // 4. Check Member busy
    const memberEnrollments = await Enrollment.find({ memberId: memberObjectId }).session(session);
    const memberEnrollmentIds = memberEnrollments.map(e => e._id);
    
    const memberBusy = await Booking.findOne({
      trainingDateId,
      timeSlotId,
      status: { $in: ['PendingTrainerConfirm', 'Booked'] },
      enrollmentId: { $in: memberEnrollmentIds }
    }).session(session);
    
    if (memberBusy) {
      throw { status: 400, message: 'Bạn đã có một lịch tập khác vào khung giờ này' };
    }

    // 5. Check PT busy
    const trainerId = enrollment.trainerId;
    const trainerDayStatus = await TrainerDayStatus.findOne({ trainerId, trainingDateId }).session(session);
    if (trainerDayStatus && trainerDayStatus.status === 'Unavailable') {
      throw { status: 400, message: 'PT không làm việc trong ngày này.' };
    }
    const trainerSlotStatus = await TrainerSlotStatus.findOne({ trainerId, trainingDateId, timeSlotId }).session(session);
    if (trainerSlotStatus && trainerSlotStatus.status === 'Unavailable') {
      throw { status: 400, message: 'PT không làm việc trong khung giờ này.' };
    }

    const trainerEnrollments = await Enrollment.find({ trainerId }).session(session);
    const trainerEnrollmentIds = trainerEnrollments.map(e => e._id);

    const ptBusy = await Booking.findOne({
      trainingDateId,
      timeSlotId,
      status: { $in: ['PendingTrainerConfirm', 'Booked'] },
      enrollmentId: { $in: trainerEnrollmentIds }
    }).session(session);

    if (ptBusy) {
      throw { status: 400, message: 'PT của bạn đã có lịch dạy vào khung giờ này' };
    }

    // 6. Create booking
    const booking = await Booking.create([{
      timeSlotId, trainingDateId,
      enrollmentId: enrollment._id,
      status: 'PendingTrainerConfirm'
    }], { session });

    // 7. Deduct session immediately -> REMOVED: Now deduct only on completion or late cancel
    // enrollment.remainingSessions -= 1;
    // await enrollment.save({ session });

    await session.commitTransaction();

    if (io) io.emit('slotUpdated', { timeSlotId, trainingDateId, status: 'PendingTrainerConfirm' });

    return booking[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Cancel a session
 */
exports.cancelSession = async (bookingId, io, userId, role) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId)
      .populate('timeSlotId')
      .populate('trainingDateId')
      .populate('enrollmentId')
      .session(session);

    if (!booking || !['PendingTrainerConfirm', 'Booked'].includes(booking.status)) {
      throw { status: 400, message: 'Lịch tập không hợp lệ hoặc đã xử lý' };
    }

    // Security Check: Only Admin or the owner (Member) can cancel
    if (role !== 'ADMIN') {
      const isOwner = booking.enrollmentId && booking.enrollmentId.memberId.toString() === userId.toString();
      if (!isOwner) {
        throw { status: 403, message: 'Bạn không có quyền hủy lịch tập này.' };
      }
    }

    // Check 2-hour rule (Keep the rule from original code)
    const sessionDate = new Date(booking.trainingDateId.date);
    const [hours, minutes] = booking.timeSlotId.startTime.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);

    // Cancel booking
    booking.status = 'Cancelled';
    await booking.save({ session });

    // Refund session -> MODIFIED: Only refund (or rather, don't deduct) if early.
    // If late (<4h), we deduct 1 session as penalty.
    const enrollment = await Enrollment.findById(booking.enrollmentId).session(session);
    if (enrollment && diffHours < 4) {
      enrollment.remainingSessions -= 1;
      await enrollment.save({ session });
    }

    await session.commitTransaction();

    if (io) {
      io.emit('slotUpdated', { timeSlotId: booking.timeSlotId._id, trainingDateId: booking.trainingDateId._id, status: 'Active' });
      if (enrollment && diffHours < 4) {
        io.emit('sessionUpdated', { 
            memberId: enrollment.memberId, 
            remainingSessions: enrollment.remainingSessions 
        });
      }
    }

    return { message: diffHours < 4 ? 'Hủy muộn: Bạn đã bị trừ 1 buổi tập.' : 'Hủy lịch tập thành công' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Complete a session
 */
exports.completeSession = async (bookingId, io, trainerIdFromToken) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(bookingId)
      .populate('timeSlotId')
      .populate('trainingDateId')
      .session(session);

    if (!booking || booking.status !== 'Booked') {
      throw { status: 400, message: 'Lịch tập không hợp lệ. Chỉ có thể xác nhận buổi học đang ở trạng thái "Đã đặt".' };
    }

    // PT can only mark session as completed after scheduled end time.
    const sessionEnd = new Date(booking.trainingDateId.date);
    const [endHour, endMinute] = booking.timeSlotId.endTime.split(':');
    sessionEnd.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
    if (new Date() < sessionEnd) {
      throw { status: 400, message: 'Chưa đến giờ kết thúc buổi tập. Bạn chỉ có thể xác nhận hoàn thành sau khi buổi tập kết thúc.' };
    }

    const owningEnrollment = await Enrollment.findById(booking.enrollmentId).session(session);
    if (!owningEnrollment || owningEnrollment.trainerId.toString() !== trainerIdFromToken.toString()) {
      throw { status: 403, message: 'Bạn chỉ có thể xác nhận buổi tập của chính mình.' };
    }

    booking.status = 'Completed';
    await booking.save({ session });

    // Deduct session on completion
    const enrollment = owningEnrollment;
    if (enrollment) {
      enrollment.remainingSessions -= 1;
      await enrollment.save({ session });
    }

    await session.commitTransaction();

    if (io) {
      io.emit('sessionUpdated', { id: bookingId, status: 'Completed' });
      if (enrollment) {
        io.emit('sessionUpdated', { 
          memberId: enrollment.memberId, 
          remainingSessions: enrollment.remainingSessions 
        });
      }
    }

    return { message: 'Hoàn thành buổi tập thành công' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

exports.acceptSession = async (bookingId, io, trainerIdFromToken) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking || booking.status !== 'PendingTrainerConfirm') {
      throw { status: 400, message: 'Lịch tập không hợp lệ để nhận.' };
    }
    const enrollment = await Enrollment.findById(booking.enrollmentId).session(session);
    if (!enrollment || enrollment.trainerId.toString() !== trainerIdFromToken.toString()) {
      throw { status: 403, message: 'Bạn chỉ có thể nhận lịch của chính mình.' };
    }
    booking.status = 'Booked';
    await booking.save({ session });
    await session.commitTransaction();
    if (io) io.emit('sessionUpdated', { id: bookingId, status: 'Booked' });
    return { message: 'Đã nhận lịch tập.' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

exports.rejectSession = async (bookingId, io, trainerIdFromToken) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking || booking.status !== 'PendingTrainerConfirm') {
      throw { status: 400, message: 'Lịch tập không hợp lệ để từ chối.' };
    }
    const enrollment = await Enrollment.findById(booking.enrollmentId).session(session);
    if (!enrollment || enrollment.trainerId.toString() !== trainerIdFromToken.toString()) {
      throw { status: 403, message: 'Bạn chỉ có thể từ chối lịch của chính mình.' };
    }
    booking.status = 'Rejected';
    await booking.save({ session });
    await session.commitTransaction();
    if (io) {
      io.emit('slotUpdated', { timeSlotId: booking.timeSlotId, trainingDateId: booking.trainingDateId, status: 'Active' });
      io.emit('sessionUpdated', { id: bookingId, status: 'Rejected' });
    }
    return { message: 'Đã từ chối lịch tập.' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
