const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const CoursePackage = require('../models/CoursePackage');
const Booking = require('../models/Booking');
const TrainingDate = require('../models/TrainingDate');
const TimeSlot = require('../models/TimeSlot');

async function createScenario() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Find PT Nguyễn Quốc Thắng
    let pt = await User.findOne({ fullName: /Nguyễn Quốc Thắng/i, role: 'TRAINER' });
    if (!pt) {
      console.log('PT not found, creating one...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      pt = await User.create({
        fullName: 'Nguyễn Quốc Thắng',
        phoneNumber: '0987654321',
        password: hashedPassword,
        role: 'TRAINER',
        gender: 'Male',
        status: 'Active'
      });
    }

    // 2. Find/Create Package
    let pkg = await CoursePackage.findOne();
    if (!pkg) {
      pkg = await CoursePackage.create({
        name: 'Gói tập thử 10 buổi',
        price: 500000,
        totalSessions: 10,
        description: 'Gói tập cơ bản',
        status: 'Active'
      });
    }

    // 3. Create Users
    const usersData = [
      { name: 'Nguyễn Đình Khoa', phone: '0775595189', dob: '2005-09-07', hasEnrollment: true },
      { name: 'Trần Văn Test', phone: '0909123456', dob: '2000-01-01', hasEnrollment: true },
      { name: 'Lê Thị Mới', phone: '0888123123', dob: '1998-05-20', hasEnrollment: false }
    ];

    for (const u of usersData) {
      let user = await User.findOne({ phoneNumber: u.phone });
      if (user) await User.deleteOne({ _id: user._id });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.phone, salt);
      user = await User.create({
        fullName: u.name,
        phoneNumber: u.phone,
        password: hashedPassword,
        role: 'MEMBER',
        gender: u.name.includes('Lê Thị') ? 'Female' : 'Male',
        dateOfBirth: new Date(u.dob),
        status: 'Active'
      });
      console.log(`Created User: ${u.name}`);

      if (u.hasEnrollment) {
        const enrollment = await Enrollment.create({
          memberId: user._id,
          packageId: pkg._id,
          trainerId: pt._id,
          registrationDate: new Date('2026-04-01'),
          totalSessions: pkg.totalSessions,
          remainingSessions: 0, 
        });

        const slots = await TimeSlot.find().limit(5);
        if (slots.length > 0) {
          for (let i = 0; i < 5; i++) {
            const date = new Date('2026-04-01');
            date.setDate(date.getDate() + i);
            let tDate = await TrainingDate.findOne({ 
              date: { $gte: new Date(date.setHours(0,0,0,0)), $lte: new Date(date.setHours(23,59,59,999)) } 
            });
            if (!tDate) tDate = await TrainingDate.create({ date, status: 'Active' });
            const slot = slots[i % slots.length];
            await Booking.create({
              timeSlotId: slot._id,
              trainingDateId: tDate._id,
              enrollmentId: enrollment._id,
              memberId: user._id,
              trainerId: pt._id,
              status: 'Completed'
            });
          }
        }
        console.log(`Created Enrollment & Bookings for ${u.name}`);
      }
    }

    console.log('\n--- SCENARIO UPDATED ---');
    console.log('User 1: Nguyễn Đình Khoa (0775595189) - Có HĐ, 0 buổi');
    console.log('User 2: Trần Văn Test (0909123456) - Có HĐ, 0 buổi');
    console.log('User 3: Lê Thị Mới (0888123123) - KHÔNG CÓ HỢP ĐỒNG');
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createScenario();
