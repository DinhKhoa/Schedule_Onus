const mongoose = require('mongoose');
const LichTap = require('../models/LichTap');
const GioTap = require('../models/GioTap');
const DangKyKhoaTap = require('../models/DangKyKhoaTap');
const NgayTap = require('../models/NgayTap');

/**
 * Book a session
 * Business rules:
 * - Cannot book in the past
 * - Slot must be available (trangThai = 'Trong')
 * - Member must have remaining sessions (soBuoiConLai > 0)
 * - Sessions deducted from oldest active enrollment
 */
exports.bookSession = async (data, io) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { hoiVienId, gioTapId, ngayTapId, ptId } = data;

    // Check slot availability (by looking for existing booking)
    const existingBooking = await LichTap.findOne({ 
      gioTapId, 
      ngayTapId, 
      trangThai: { $ne: 'DaHuy' } 
    }).session(session);

    if (existingBooking) {
      throw { status: 400, message: 'Khung giờ này đã có người đặt' };
    }

    // Check slot exists and is active
    const slot = await GioTap.findById(gioTapId).session(session);
    if (!slot || slot.trangThai === 'Tat') {
      throw { status: 400, message: 'Khung giờ không khả dụng' };
    }

    // Check day is not in the past
    const day = await NgayTap.findById(ngayTapId).session(session);
    if (!day || day.trangThai === 'Tat' || new Date(day.ngay) < new Date().setHours(0, 0, 0, 0)) {
      throw { status: 400, message: 'Ngày tập không khả dụng hoặc trong quá khứ' };
    }

    // Find oldest active enrollment with remaining sessions
    const enrollment = await DangKyKhoaTap.findOne({
      hoiVienId, ptId, soBuoiConLai: { $gt: 0 }
    }).sort({ ngayDangKy: 1 }).session(session);

    if (!enrollment) {
      throw { status: 400, message: 'Không còn buổi tập khả dụng' };
    }

    const booking = await LichTap.create([{
      gioTapId, ngayTapId,
      dangKyKhoaTapId: enrollment._id,
      trangThai: 'DaDat'
    }], { session });

    await session.commitTransaction();

    if (io) io.emit('slotUpdated', { gioTapId, ngayTapId, trangThai: 'DaDat' });

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
 * Business rules:
 * - Can only cancel if > 2 hours before session
 * - If within 2 hours, PT can still mark complete and deduct session
 */
exports.cancelSession = async (lichTapId, io) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await LichTap.findById(lichTapId)
      .populate('gioTapId')
      .populate('ngayTapId')
      .session(session);

    if (!booking || booking.trangThai !== 'DaDat') {
      throw { status: 400, message: 'Lịch tập không hợp lệ hoặc đã xử lý' };
    }

    // Check 2-hour rule
    const sessionDate = new Date(booking.ngayTapId.ngay);
    const [hours, minutes] = booking.gioTapId.gioBatDau.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      throw { status: 400, message: 'Không thể hủy trong vòng 2 giờ trước buổi tập' };
    }

    // Cancel booking
    booking.trangThai = 'DaHuy';
    await booking.save({ session });

    await session.commitTransaction();

    if (io) io.emit('slotUpdated', { gioTapId: booking.gioTapId._id, ngayTapId: booking.ngayTapId._id, trangThai: 'Trong' });

    return { message: 'Hủy lịch tập thành công' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Complete a session (PT action)
 * Business rules:
 * - Session must have started (not in the future)
 * - Deducts one session from enrollment
 * - Completed sessions are final
 */
exports.completeSession = async (lichTapId, io) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await LichTap.findById(lichTapId)
      .populate('gioTapId')
      .populate('ngayTapId')
      .populate({
          path: 'dangKyKhoaTapId',
          populate: { path: 'hoiVienId' }
      })
      .session(session);

    if (!booking || booking.trangThai === 'DaHoanThanh') {
      throw { status: 400, message: 'Lịch tập không hợp lệ hoặc đã hoàn thành' };
    }

    // Mark as completed
    booking.trangThai = 'DaHoanThanh';
    await booking.save({ session });

    // Deduct session from enrollment
    const enrollment = await DangKyKhoaTap.findById(booking.dangKyKhoaTapId).session(session);
    if (enrollment && enrollment.soBuoiConLai > 0) {
      enrollment.soBuoiConLai -= 1;
      await enrollment.save({ session });
    }

    await session.commitTransaction();

    if (io && enrollment) {
      io.emit('sessionCompleted', {
        hoiVienId: enrollment.hoiVienId,
        soBuoiConLai: enrollment.soBuoiConLai
      });
    }

    return { message: 'Hoàn thành buổi tập thành công' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
