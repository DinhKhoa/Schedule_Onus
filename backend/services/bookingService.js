const mongoose = require('mongoose');
const LichTap = require('../models/LichTap');
const GioTap = require('../models/GioTap');
const NgayGioTap = require('../models/NgayGioTap');
const DangKyKhoaTap = require('../models/DangKyKhoaTap');
const NgayTap = require('../models/NgayTap');

/**
 * Book a session
 */
exports.bookSession = async (data, io) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { hoiVienId, gioTapId, ngayTapId } = data;

    // 1. Get slot and day info
    const slot = await GioTap.findById(gioTapId).session(session);
    if (!slot || slot.trangThai === 'NgungHoatDong') {
      throw { status: 400, message: 'Khung giờ không khả dụng' };
    }

    // 1b. Check per-day override (NgayGioTap)
    const override = await NgayGioTap.findOne({ ngayTapId, gioTapId }).session(session);
    if (override && override.trangThai === 'NgungHoatDong') {
      throw { status: 400, message: 'Khung giờ không khả dụng vào ngày này' };
    }

    const day = await NgayTap.findById(ngayTapId).session(session);
    if (!day || day.trangThai === 'NgungHoatDong') {
      throw { status: 400, message: 'Ngày tập không khả dụng' };
    }

    // 2. Prevent booking in the past (date + time)
    const sessionDate = new Date(day.ngay);
    const [hours, minutes] = slot.gioBatDau.split(':');
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (sessionDate <= new Date()) {
      throw { status: 400, message: 'Không thể đặt khung giờ trong quá khứ' };
    }

    // 2. Find active enrollment (oldest first: by ngayDangKy then createdAt)
    const enrollment = await DangKyKhoaTap.findOne({
      hoiVienId,
      soBuoiConLai: { $gt: 0 }
    }).sort({ ngayDangKy: 1, createdAt: 1 }).session(session);

    if (!enrollment) {
      throw { status: 400, message: 'Bạn không còn buổi tập khả dụng. Vui lòng đăng ký khóa tập mới.' };
    }

    // 4. Check Member busy (already has another booking in this slot)
    const memberBooking = await LichTap.findOne({
      ngayTapId,
      gioTapId,
      trangThai: 'DaDat'
    }).populate({
      path: 'dangKyKhoaTapId',
      match: { hoiVienId }
    }).session(session);

    if (memberBooking && memberBooking.dangKyKhoaTapId) {
      throw { status: 400, message: 'Bạn đã có một lịch tập khác vào khung giờ này' };
    }

    // 5. Check PT busy (assigned PT is already teaching someone else)
    const ptId = enrollment.ptId;
    const ptBooking = await LichTap.findOne({
      ngayTapId,
      gioTapId,
      trangThai: 'DaDat'
    }).populate({
      path: 'dangKyKhoaTapId',
      match: { ptId }
    }).session(session);

    if (ptBooking && ptBooking.dangKyKhoaTapId) {
      throw { status: 400, message: 'PT của bạn đã có lịch dạy vào khung giờ này' };
    }

    // 6. Create booking
    const booking = await LichTap.create([{
      gioTapId, ngayTapId,
      dangKyKhoaTapId: enrollment._id,
      trangThai: 'DaDat'
    }], { session });

    // 7. Deduct session immediately (Prevent overbooking)
    enrollment.soBuoiConLai -= 1;
    await enrollment.save({ session });

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
 * - Refund session to enrollment
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

    // 8. Refund session (Level 1 Point 2 fix)
    const enrollment = await DangKyKhoaTap.findById(booking.dangKyKhoaTapId).session(session);
    if (enrollment) {
      enrollment.soBuoiConLai += 1;
      await enrollment.save({ session });
    }

    await session.commitTransaction();

    if (io) {
      io.emit('slotUpdated', { gioTapId: booking.gioTapId._id, ngayTapId: booking.ngayTapId._id, trangThai: 'HoatDong' });
      if (enrollment) {
        io.emit('sessionRefunded', { 
            hoiVienId: enrollment.hoiVienId, 
            soBuoiConLai: enrollment.soBuoiConLai 
        });
      }
    }

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
 * - Session status 'DaDat' -> 'DaHoanThanh'
 * - Sessions were already deducted at booking, no need to deduct here.
 */
exports.completeSession = async (lichTapId, io) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await LichTap.findById(lichTapId).session(session);

    if (!booking || booking.trangThai !== 'DaDat') {
      throw { status: 400, message: 'Lịch tập không hợp lệ. Chỉ có thể xác nhận buổi học đang ở trạng thái "Đã đặt".' };
    }

    // Mark as completed
    booking.trangThai = 'DaHoanThanh';
    await booking.save({ session });

    await session.commitTransaction();

    if (io) io.emit('sessionUpdated', { id: lichTapId, trangThai: 'DaHoanThanh' });

    return { message: 'Hoàn thành buổi tập thành công' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
