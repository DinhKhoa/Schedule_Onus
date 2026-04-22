const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, './.env') });

const User = require('./models/User');
const LichTap = require('./models/LichTap');
const NgayTap = require('./models/NgayTap');
const GioTap = require('./models/GioTap');
const DangKyKhoaTap = require('./models/DangKyKhoaTap');

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const ptId = '69e726d7d1088e5834cf776d';
    const targetDate = '2026-04-23';

    // 1. Find PT
    const pt = await User.findById(ptId);
    console.log('PT Found:', pt ? pt.hoTen : 'NOT FOUND');

    // 2. Find NgayTap for target date
    const ngayTap = await NgayTap.findOne({ 
      ngay: { 
        $gte: new Date(`${targetDate}T00:00:00Z`), 
        $lte: new Date(`${targetDate}T23:59:59Z`) 
      } 
    });
    console.log('NgayTap for', targetDate, ':', ngayTap ? ngayTap._id : 'NOT FOUND');

    if (!ngayTap) {
        // List some NgayTap to see format
        const someNgayTap = await NgayTap.find().limit(5);
        console.log('Some NgayTap dates:', someNgayTap.map(n => n.ngay));
    }

    // 3. Find Enrollments for this PT
    const enrollments = await DangKyKhoaTap.find({ ptId: ptId });
    console.log('Enrollments for PT (count):', enrollments.length);
    const enrollmentIds = enrollments.map(e => e._id);

    // 4. Find LichTap for these Enrollments and Date
    const query = {
      dangKyKhoaTapId: { $in: enrollmentIds }
    };
    if (ngayTap) {
        query.ngayTapId = ngayTap._id;
    }

    const lichTapEntries = await LichTap.find(query)
      .populate('gioTapId')
      .populate('ngayTapId')
      .populate({
        path: 'dangKyKhoaTapId',
        populate: { path: 'hoiVienId', select: 'hoTen' }
      });

    console.log('LichTap entries found:', lichTapEntries.length);
    lichTapEntries.forEach(lt => {
      console.log(`- ID: ${lt._id}, Date: ${lt.ngayTapId.ngay}, Time: ${lt.gioTapId.gioBatDau}, Status: ${lt.trangThai}, Member: ${lt.dangKyKhoaTapId.hoiVienId.hoTen}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugData();
