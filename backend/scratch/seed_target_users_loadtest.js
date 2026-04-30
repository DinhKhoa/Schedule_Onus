const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const CoursePackage = require('../models/CoursePackage');
const Enrollment = require('../models/Enrollment');
const Booking = require('../models/Booking');
const TrainingDate = require('../models/TrainingDate');
const TimeSlot = require('../models/TimeSlot');

const TARGET_NAMES = [
  'Nguyen Quoc Thang',
  'Pham Thi Ha',
  'Nguyen Thi Thuy Dung',
  'Tran Thi Kieu Giang',
  'Hoi vien',
  'Nguyen PT',
  'Nguyen P P',
  'Nguyen Duc Anh'
];

function normalizeVietnamese(input) {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

async function ensureTrainingDates(from, to) {
  const dates = [];
  for (let d = startOfDay(from); d <= to; d = addDays(d, 1)) {
    dates.push(new Date(d));
  }
  for (const date of dates) {
    await TrainingDate.updateOne(
      { date },
      { $setOnInsert: { date, status: 'Active' } },
      { upsert: true }
    );
  }
  return TrainingDate.find({ date: { $gte: from, $lte: to }, status: 'Active' }).sort({ date: 1 });
}

async function ensureTimeSlots() {
  const baseSlots = [
    ['06:00', '07:30'],
    ['08:00', '09:30'],
    ['10:00', '11:30'],
    ['14:00', '15:30'],
    ['16:00', '17:30'],
    ['18:00', '19:30']
  ];

  for (const [startTime, endTime] of baseSlots) {
    await TimeSlot.updateOne(
      { startTime, endTime },
      { $setOnInsert: { startTime, endTime, status: 'Active' } },
      { upsert: true }
    );
  }

  return TimeSlot.find({ status: 'Active' }).sort({ startTime: 1 });
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected MongoDB');

  const users = await User.find({ status: 'Active' });
  const targetNormSet = new Set(TARGET_NAMES.map(normalizeVietnamese));
  const matched = users.filter(u => targetNormSet.has(normalizeVietnamese(u.fullName)));

  const foundNormSet = new Set(matched.map(u => normalizeVietnamese(u.fullName)));
  const missing = TARGET_NAMES.filter(name => !foundNormSet.has(normalizeVietnamese(name)));

  const members = matched.filter(u => u.role === 'MEMBER');
  const trainers = matched.filter(u => u.role === 'TRAINER');

  console.log('Matched users:', matched.map(u => `${u.fullName} (${u.role})`).join(', ') || '(none)');
  if (missing.length) console.log('Missing target users:', missing.join(', '));
  console.log(`Members: ${members.length}, Trainers: ${trainers.length}`);

  if (members.length === 0 || trainers.length === 0) {
    throw new Error('Can not seed: need at least 1 MEMBER and 1 TRAINER from target users.');
  }

  const today = startOfDay(new Date());
  const fromDate = addDays(today, -7);
  const toDate = addDays(today, 7);

  const trainingDates = await ensureTrainingDates(fromDate, toDate);
  const timeSlots = await ensureTimeSlots();
  if (!trainingDates.length || !timeSlots.length) throw new Error('Missing training dates or time slots.');

  const packageNamePool = [
    'Yoga can bang',
    'Gym suc manh',
    'Pilates core',
    'Cardio dot mo',
    'HIIT nang cao',
    'Mobility phuc hoi',
    'Boxing co ban',
    'Kickboxing tong hop',
    'Calisthenics nen tang',
    'Functional training',
    'Tang co giam mo',
    'Cai thien tu the'
  ];

  // Rename old seeded packages that still have suffix " - Dot ##"
  const oldSeededPackages = await CoursePackage.find({ name: / - Dot \d{2}$/i }).sort({ createdAt: 1 });
  for (let i = 0; i < oldSeededPackages.length; i++) {
    const pkg = oldSeededPackages[i];
    const targetName = packageNamePool[i % packageNamePool.length];
    const existing = await CoursePackage.findOne({ name: targetName, _id: { $ne: pkg._id } });
    if (existing) continue;
    pkg.name = targetName;
    await pkg.save();
  }

  const createdPackages = [];
  for (let i = 0; i < packageNamePool.length; i++) {
    const name = packageNamePool[i];
    const totalSessions = [8, 10, 12, 15, 20, 24][i % 6];
    const pkg = await CoursePackage.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, totalSessions } },
      { upsert: true, new: true }
    );
    createdPackages.push(pkg);
  }

  const enrollments = [];
  let enrollCount = 0;
  for (let i = 0; i < 160; i++) {
    const member = members[i % members.length];
    const trainer = trainers[i % trainers.length];
    const pkg = createdPackages[i % createdPackages.length];
    const registrationDate = addDays(today, -7 + (i % 8));
    const used = i % 4;
    const totalSessions = pkg.totalSessions;
    const remainingSessions = Math.max(0, totalSessions - used);

    const existing = await Enrollment.findOne({
      memberId: member._id,
      trainerId: trainer._id,
      packageId: pkg._id,
      registrationDate: { $gte: startOfDay(registrationDate), $lt: addDays(startOfDay(registrationDate), 1) }
    });
    if (existing) {
      enrollments.push(existing);
      continue;
    }

    const enrollment = await Enrollment.create({
      memberId: member._id,
      trainerId: trainer._id,
      packageId: pkg._id,
      registrationDate,
      totalSessions,
      remainingSessions
    });
    enrollments.push(enrollment);
    enrollCount += 1;
  }

  let bookingCount = 0;
  const statuses = ['Completed', 'Booked', 'PendingTrainerConfirm'];
  for (let i = 0; i < enrollments.length; i++) {
    const enrollment = enrollments[i];
    for (let j = 0; j < 8; j++) {
      const d = trainingDates[(i + j) % trainingDates.length];
      const s = timeSlots[(i + j * 2) % timeSlots.length];
      const status = d.date < today ? 'Completed' : statuses[(i + j) % statuses.length];

      const existing = await Booking.findOne({
        enrollmentId: enrollment._id,
        trainingDateId: d._id,
        timeSlotId: s._id
      });
      if (existing) continue;

      await Booking.create({
        enrollmentId: enrollment._id,
        trainingDateId: d._id,
        timeSlotId: s._id,
        status
      });
      bookingCount += 1;
    }
  }

  console.log('Seed done');
  console.log(`Created/ensured packages: ${createdPackages.length}`);
  console.log(`New enrollments: ${enrollCount}`);
  console.log(`New bookings: ${bookingCount}`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed error:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
