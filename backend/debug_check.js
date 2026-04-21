const mongoose = require('mongoose');
const User = require('./models/User');
const DangKyKhoaTap = require('./models/DangKyKhoaTap');
const LichTap = require('./models/LichTap');
const KhoaTap = require('./models/KhoaTap'); // Added
const NgayTap = require('./models/NgayTap'); // Added
const GioTap = require('./models/GioTap');   // Added
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ hoTen: /Nguyễn Đình Khoa/i });
    if (!user) {
      console.log('❌ Không tìm thấy user Nguyễn Đình Khoa');
      process.exit(0);
    }
    
    console.log(`✅ Tìm thấy user: ${user.hoTen} (ID: ${user._id})`);
    
    const enrollments = await DangKyKhoaTap.find({ hoiVienId: user._id }).populate('khoaTapId ptId');
    console.log(`\n📋 Danh sách đăng ký khóa tập (${enrollments.length}):`);
    enrollments.forEach(e => {
      console.log(`- Khóa: ${e.khoaTapId?.tenKhoaTap || 'N/A'} | PT: ${e.ptId?.hoTen || 'N/A'} | Buổi còn lại: ${e.soBuoiConLai}`);
    });

    const enrollIds = enrollments.map(e => e._id);
    const bookings = await LichTap.find({ dangKyKhoaTapId: { $in: enrollIds } })
      .populate('ngayTapId gioTapId');
    
    console.log(`\n📅 Danh sách lịch tập (đã đặt) (${bookings.length}):`);
    bookings.forEach(b => {
      const dateStr = b.ngayTapId?.ngay ? b.ngayTapId.ngay.toLocaleDateString() : 'N/A';
      const timeStr = b.gioTapId?.gioBatDau || 'N/A';
      console.log(`- Ngày: ${dateStr} | Giờ: ${timeStr} | Trạng thái: ${b.trangThai}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUser();
