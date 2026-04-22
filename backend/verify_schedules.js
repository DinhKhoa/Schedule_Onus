require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const NgayTap = require('./models/NgayTap');
const GioTap = require('./models/GioTap');
const DangKyKhoaTap = require('./models/DangKyKhoaTap');
const LichTap = require('./models/LichTap');
const KhoaTap = require('./models/KhoaTap');

async function checkSchedules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const schedules = await LichTap.find({})
      .populate('ngayTapId')
      .populate('gioTapId')
      .populate({
        path: 'dangKyKhoaTapId',
        populate: { path: 'ptId' }
      });

    console.log(`Total schedules: ${schedules.length}`);
    schedules.forEach(s => {
      const ptName = s.dangKyKhoaTapId?.ptId?.hoTen || 'Unknown PT';
      const date = s.ngayTapId?.ngay;
      const time = s.gioTapId ? `${s.gioTapId.gioBatDau} - ${s.gioTapId.gioKetThuc}` : 'Unknown time';
      console.log(`- PT: ${ptName}, Date: ${date}, Time: ${time}, Status: ${s.trangThai}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkSchedules();
