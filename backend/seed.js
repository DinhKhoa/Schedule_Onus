/**
 * Seed script — creates complete test data for all roles
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const QuanTriVien = require('./models/QuanTriVien');
const User = require('./models/User');
const KhoaTap = require('./models/KhoaTap');
const DangKyKhoaTap = require('./models/DangKyKhoaTap');
const LichTap = require('./models/LichTap');
const NgayTap = require('./models/NgayTap');
const GioTap = require('./models/GioTap');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // ==========================================
    // 1. CLEAR ALL DATA — Clean Reset
    // ==========================================
    await Promise.all([
      QuanTriVien.deleteMany({}),
      User.deleteMany({}),
      KhoaTap.deleteMany({}),
      DangKyKhoaTap.deleteMany({}),
      LichTap.deleteMany({}),
      NgayTap.deleteMany({}),
      GioTap.deleteMany({})
    ]);
    console.log('🗑️  Database cleared (All collections dropped)');

    // ==========================================
    // 2. CREATE ADMIN
    // ==========================================
    const adminPassword = await bcrypt.hash('admin123', 10);
    await QuanTriVien.create({
      taiKhoan: 'admin',
      matKhau: adminPassword,
      hoTen: 'Quản Trị Viên'
    });
    console.log('✅ Admin created');

    // ==========================================
    // 3. CREATE PT ACCOUNTS
    // ==========================================
    const ptPassword = await bcrypt.hash('pt123456', 10);
    const pt1 = await User.create({
      hoTen: 'Nguyễn Văn PT',
      soDienThoai: '0901000001',
      matKhau: ptPassword,
      gioiTinh: 'Nam',
      ngaySinh: new Date('1990-05-15'),
      vaiTro: 'PT',
      trangThai: 'HoatDong'
    });

    const pt2 = await User.create({
      hoTen: 'Trần Thị Huấn Luyện',
      soDienThoai: '0901000003',
      matKhau: ptPassword,
      gioiTinh: 'Nữ',
      ngaySinh: new Date('1992-03-20'),
      vaiTro: 'PT',
      trangThai: 'HoatDong'
    });
    console.log('✅ PT accounts created (2)');

    // ==========================================
    // 4. CREATE MEMBER ACCOUNTS
    // ==========================================
    const memberPassword = await bcrypt.hash('member123', 10);
    const member1 = await User.create({
      hoTen: 'Trần Thị Hội Viên',
      soDienThoai: '0901000002',
      matKhau: memberPassword,
      gioiTinh: 'Nữ',
      ngaySinh: new Date('1995-08-20'),
      vaiTro: 'HOIVIEN',
      trangThai: 'HoatDong'
    });

    const member2 = await User.create({
      hoTen: 'Lê Văn Khách',
      soDienThoai: '0901000004',
      matKhau: memberPassword,
      gioiTinh: 'Nam',
      ngaySinh: new Date('1998-11-10'),
      vaiTro: 'HOIVIEN',
      trangThai: 'HoatDong'
    });
    console.log('✅ Member accounts created (2)');

    // ==========================================
    // 5. CREATE COURSES (KhoaTap)
    // ==========================================
    const courses = await KhoaTap.insertMany([
      { tenKhoaTap: 'Yoga cơ bản', soBuoi: 10 },
      { tenKhoaTap: 'Gym nâng cao', soBuoi: 20 },
      { tenKhoaTap: 'Pilates', soBuoi: 15 },
      { tenKhoaTap: 'Boxing', soBuoi: 12 }
    ]);
    console.log('✅ Courses created (4)');

    // ==========================================
    // 6. CREATE ENROLLMENTS (DangKyKhoaTap)
    // ==========================================
    // Member 1 — enrolled in "Yoga cơ bản" with PT1 (older registration, some sessions used)
    await DangKyKhoaTap.create({
      hoiVienId: member1._id,
      khoaTapId: courses[0]._id, // Yoga cơ bản
      ptId: pt1._id,
      ngayDangKy: new Date('2025-12-01'),
      soBuoiConLai: 7 // used 3 out of 10
    });

    // Member 1 — also enrolled in "Gym nâng cao" with PT1 (newer registration)
    await DangKyKhoaTap.create({
      hoiVienId: member1._id,
      khoaTapId: courses[1]._id, // Gym nâng cao
      ptId: pt1._id,
      ngayDangKy: new Date('2026-02-15'),
      soBuoiConLai: 20
    });

    // Member 2 — enrolled in "Pilates" with PT2
    await DangKyKhoaTap.create({
      hoiVienId: member2._id,
      khoaTapId: courses[2]._id, // Pilates
      ptId: pt2._id,
      ngayDangKy: new Date('2026-01-10'),
      soBuoiConLai: 12 // used 3 out of 15
    });

    // Member 2 — enrolled in "Boxing" with PT1
    await DangKyKhoaTap.create({
      hoiVienId: member2._id,
      khoaTapId: courses[3]._id, // Boxing
      ptId: pt1._id,
      ngayDangKy: new Date('2026-03-01'),
      soBuoiConLai: 12
    });

    console.log('✅ Enrollments created (4)');

    // ==========================================
    // 7. CREATE NGAYTAP — Today + Next 13 days (2 weeks)
    // ==========================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToCreate = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      daysToCreate.push({
        ngay: date,
        trangThai: 'HoatDong'
      });
    }

    const createdDays = await NgayTap.insertMany(daysToCreate);
    console.log(`✅ NgayTap created (${createdDays.length} days: today + next 13 days)`);

    // ==========================================
    // 8. CREATE GIOTAP — Standard time slots
    // ==========================================
    await GioTap.insertMany([
      { gioBatDau: '06:00', gioKetThuc: '07:30', trangThai: 'HoatDong' },
      { gioBatDau: '08:00', gioKetThuc: '09:30', trangThai: 'HoatDong' },
      { gioBatDau: '10:00', gioKetThuc: '11:30', trangThai: 'HoatDong' },
      { gioBatDau: '14:00', gioKetThuc: '15:30', trangThai: 'HoatDong' },
      { gioBatDau: '16:00', gioKetThuc: '17:30', trangThai: 'HoatDong' },
      { gioBatDau: '18:00', gioKetThuc: '19:30', trangThai: 'HoatDong' }
    ]);
    console.log('✅ GioTap created (6 time slots)');

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n========================================');
    console.log('          🎉 SEED COMPLETED!           ');
    console.log('========================================');
    console.log('');
    console.log('📋 TEST ACCOUNTS:');
    console.log('------------------------------------------');
    console.log('  ADMIN:    admin       / admin123');
    console.log('  PT 1:     0901000001  / pt123456');
    console.log('  PT 2:     0901000003  / pt123456');
    console.log('  MEMBER 1: 0901000002  / member123');
    console.log('  MEMBER 2: 0901000004  / member123');
    console.log('------------------------------------------');
    console.log('');
    console.log('📊 DATA SUMMARY:');
    console.log('  Courses:      4');
    console.log('  Enrollments:  4');
    console.log('  NgayTap:      14 (today + 13 days)');
    console.log('  GioTap:       6 slots');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
