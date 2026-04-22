const mongoose = require('mongoose');
const User = require('../models/User');
const QuanTriVien = require('../models/QuanTriVien');
const KhoaTap = require('../models/KhoaTap');
const DangKyKhoaTap = require('../models/DangKyKhoaTap');
const NgayTap = require('../models/NgayTap');
const GioTap = require('../models/GioTap');
const LichTap = require('../models/LichTap');

require('dotenv').config({ path: '.env' });

async function mockData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Find Tester
    let tester = await User.findOne({ hoTen: /Tester/i, vaiTro: 'HOIVIEN' });
    if (!tester) {
      console.log('Tester not found, creating one...');
      tester = new User({
        hoTen: 'Hội viên Tester',
        soDienThoai: '0999999999',
        matKhau: '$2b$10$X', // dummy hash
        vaiTro: 'HOIVIEN',
        trangThai: 'HoatDong'
      });
      await tester.save();
    }
    console.log('Tester ID:', tester._id);

    // Find PT Thang
    let ptThang = await User.findOne({ hoTen: /Thắng/i, vaiTro: 'PT' });
    if (!ptThang) {
      console.log('PT Thắng not found, creating one...');
      ptThang = new User({
        hoTen: 'PT Thắng',
        soDienThoai: '0888888888',
        matKhau: '$2b$10$X',
        vaiTro: 'PT',
        trangThai: 'HoatDong'
      });
      await ptThang.save();
    }
    console.log('PT Thắng ID:', ptThang._id);

    // Find a KhoaTap
    let khoaTap = await KhoaTap.findOne();
    if (!khoaTap) {
        console.log('KhoaTap not found, creating one...');
        khoaTap = new KhoaTap({
            tenKhoaTap: 'Khóa Giảm Cân',
            thoiLuong: 30,
            giaTien: 1000000,
            moTa: 'Giảm cân'
        });
        await khoaTap.save();
    }
    
    // Enroll
    let enrollment = await DangKyKhoaTap.findOne({ hoiVienId: tester._id, ptId: ptThang._id, khoaTapId: khoaTap._id });
    if (!enrollment) {
      enrollment = new DangKyKhoaTap({
        hoiVienId: tester._id,
        ptId: ptThang._id,
        khoaTapId: khoaTap._id,
        trangThai: 'HoatDong',
        soBuoiDaTap: 0,
        ngayDangKy: new Date()
      });
      await enrollment.save();
    }
    console.log('Enrollment ID:', enrollment._id);

    // Find a GioTap
    let gioTap = await GioTap.findOne();
    if (!gioTap) {
        gioTap = new GioTap({ gioBatDau: '08:00', gioKetThuc: '09:00' });
        await gioTap.save();
    }

    // Mock days 21, 22, 23, 24, 25, 26
    const daysToMock = [21, 22, 23, 24, 25, 26];
    const year = 2026;
    const month = 3; // April is 3 in JS

    for (let day of daysToMock) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);

      // Add NgayTap if not exists
      // Wait, find existing NgayTap to avoid duplicates
      let ngayTap = await NgayTap.findOne({ 
        ngay: { 
            $gte: d, 
            $lt: new Date(year, month, day + 1) 
        } 
      });
      
      if (!ngayTap) {
        ngayTap = new NgayTap({ ngay: d });
        await ngayTap.save();
      }

      // Check if LichTap already exists
      let lichTap = await LichTap.findOne({
        ngayTapId: ngayTap._id,
        dangKyKhoaTapId: enrollment._id
      });

      if (!lichTap) {
        lichTap = new LichTap({
          dangKyKhoaTapId: enrollment._id,
          ngayTapId: ngayTap._id,
          gioTapId: gioTap._id,
          trangThai: 'DaDat'
        });
        await lichTap.save();
        console.log(`Mocked LichTap for ${d.toISOString().slice(0, 10)}`);
      } else {
        console.log(`LichTap for ${d.toISOString().slice(0, 10)} already exists`);
      }
    }

    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

mockData();
