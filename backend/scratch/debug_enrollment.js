const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const CoursePackage = require('../models/CoursePackage');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ fullName: /Nguyễn thị thùy dung/i });
  if (!user) {
    console.log('User not found!');
    process.exit(0);
  }
  
  console.log('User Found:', { id: user._id, fullName: user.fullName, role: user.role });
  
  const enrollments = await Enrollment.find({ memberId: user._id })
    .populate('packageId', 'name totalSessions')
    .populate('trainerId', 'fullName');
    
  console.log('Enrollments for this user:', enrollments.map(e => ({
    id: e._id,
    package: e.packageId?.name,
    trainer: e.trainerId?.fullName,
    total: e.totalSessions,
    remaining: e.remainingSessions,
    date: e.registrationDate
  })));
  
  process.exit(0);
}

debug();
