/**
 * Seed script — creates test accounts for all roles
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const QuanTriVien = require('./models/QuanTriVien');
const User = require('./models/User');
const KhoaTap = require('./models/KhoaTap');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await QuanTriVien.deleteMany({});
    await User.deleteMany({});
    await KhoaTap.deleteMany({});

    // 1. Admin account
    const adminPassword = await bcrypt.hash('admin123', 10);
    await QuanTriVien.create({
      taiKhoan: 'admin',
      matKhau: adminPassword,
      hoTen: 'Quản Trị Viên'
    });
    console.log('✅ Admin created');

    // 2. PT account
    const ptPassword = await bcrypt.hash('pt123456', 10);
    await User.create({
      hoTen: 'Nguyễn Văn PT',
      soDienThoai: '0901000001',
      matKhau: ptPassword,
      gioiTinh: 'Nam',
      ngaySinh: new Date('1990-05-15'),
      vaiTro: 'PT',
      trangThai: 'HoatDong'
    });
    console.log('✅ PT created');

    // 3. Member account
    const memberPassword = await bcrypt.hash('member123', 10);
    await User.create({
      hoTen: 'Trần Thị Hội Viên',
      soDienThoai: '0901000002',
      matKhau: memberPassword,
      gioiTinh: 'Nữ',
      ngaySinh: new Date('1995-08-20'),
      vaiTro: 'HOIVIEN',
      trangThai: 'HoatDong'
    });
    console.log('✅ Member created');

    // 4. Sample courses
    await KhoaTap.insertMany([
      { tenKhoaTap: 'Yoga cơ bản', soBuoi: 10 },
      { tenKhoaTap: 'Gym nâng cao', soBuoi: 20 },
      { tenKhoaTap: 'Pilates', soBuoi: 15 }
    ]);
    console.log('✅ Courses created');

    console.log('\n========== TEST ACCOUNTS ==========');
    console.log('ADMIN:   admin / admin123');
    console.log('PT:      0901000001 / pt123456');
    console.log('MEMBER:  0901000002 / member123');
    console.log('====================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
