const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Admin = require('./models/Admin');
const User = require('./models/User');
const CoursePackage = require('./models/CoursePackage');
const Enrollment = require('./models/Enrollment');
const Booking = require('./models/Booking');
const TrainingDate = require('./models/TrainingDate');
const TimeSlot = require('./models/TimeSlot');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. CLEAR ALL DATA
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      CoursePackage.deleteMany({}),
      Enrollment.deleteMany({}),
      Booking.deleteMany({}),
      TrainingDate.deleteMany({}),
      TimeSlot.deleteMany({})
    ]);
    console.log('🗑️ Database cleared');

    // 2. CREATE ADMIN
    const adminPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      username: 'admin',
      password: adminPassword,
      fullName: 'Quản Trị Viên'
    });
    console.log('✅ Admin created');

    // 3. CREATE PT ACCOUNTS
    const ptPassword = await bcrypt.hash('pt123456', 10);
    const pt1 = await User.create({
      fullName: 'Nguyễn Văn PT',
      phoneNumber: '0901000001',
      password: ptPassword,
      gender: 'Male',
      dateOfBirth: new Date('1990-05-15'),
      role: 'TRAINER',
      status: 'Active'
    });

    const pt2 = await User.create({
      fullName: 'Trần Thị Huấn Luyện',
      phoneNumber: '0901000003',
      password: ptPassword,
      gender: 'Female',
      dateOfBirth: new Date('1992-03-20'),
      role: 'TRAINER',
      status: 'Active'
    });
    console.log('✅ PT accounts created');

    // 4. CREATE MEMBER ACCOUNTS
    const memberPassword = await bcrypt.hash('member123', 10);
    const member1 = await User.create({
      fullName: 'Trần Thị Hội Viên',
      phoneNumber: '0901000002',
      password: memberPassword,
      gender: 'Female',
      dateOfBirth: new Date('1995-08-20'),
      role: 'MEMBER',
      status: 'Active'
    });

    const member2 = await User.create({
      fullName: 'Lê Văn Khách',
      phoneNumber: '0901000004',
      password: memberPassword,
      gender: 'Male',
      dateOfBirth: new Date('1998-11-10'),
      role: 'MEMBER',
      status: 'Active'
    });
    console.log('✅ Member accounts created');

    // 5. CREATE COURSES
    const courses = await CoursePackage.insertMany([
      { name: 'Yoga cơ bản', totalSessions: 10, status: 'Active' },
      { name: 'Gym nâng cao', totalSessions: 20, status: 'Active' },
      { name: 'Pilates', totalSessions: 15, status: 'Active' },
      { name: 'Boxing', totalSessions: 12, status: 'Active' }
    ]);
    console.log('✅ Courses created');

    // 6. CREATE ENROLLMENTS
    await Enrollment.create({
      memberId: member1._id,
      packageId: courses[0]._id,
      trainerId: pt1._id,
      registrationDate: new Date('2025-12-01'),
      totalSessions: 10,
      remainingSessions: 7
    });

    await Enrollment.create({
      memberId: member1._id,
      packageId: courses[1]._id,
      trainerId: pt1._id,
      registrationDate: new Date('2026-02-15'),
      totalSessions: 20,
      remainingSessions: 20
    });

    await Enrollment.create({
      memberId: member2._id,
      packageId: courses[2]._id,
      trainerId: pt2._id,
      registrationDate: new Date('2026-01-10'),
      totalSessions: 15,
      remainingSessions: 12
    });
    console.log('✅ Enrollments created');

    // 7. CREATE TRAINING DATES (Today + 13 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToCreate = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      daysToCreate.push({ date, status: 'Active' });
    }
    await TrainingDate.insertMany(daysToCreate);
    console.log('✅ Training dates created');

    // 8. CREATE TIME SLOTS
    await TimeSlot.insertMany([
      { startTime: '06:00', endTime: '07:30', status: 'Active' },
      { startTime: '08:00', endTime: '09:30', status: 'Active' },
      { startTime: '10:00', endTime: '11:30', status: 'Active' },
      { startTime: '14:00', endTime: '15:30', status: 'Active' },
      { startTime: '16:00', endTime: '17:30', status: 'Active' },
      { startTime: '18:00', endTime: '19:30', status: 'Active' }
    ]);
    console.log('✅ Time slots created');

    console.log('\n========================================');
    console.log('          🎉 SEED COMPLETED!           ');
    console.log('========================================');
    console.log('📋 TEST ACCOUNTS:');
    console.log('  ADMIN:    admin       / admin123');
    console.log('  PT 1:     0901000001  / pt123456');
    console.log('  PT 2:     0901000003  / pt123456');
    console.log('  MEMBER 1: 0901000002  / member123');
    console.log('  MEMBER 2: 0901000004  / member123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
