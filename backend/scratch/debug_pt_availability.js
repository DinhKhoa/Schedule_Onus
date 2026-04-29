const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const TrainingDate = require('../models/TrainingDate');
const TimeSlot = require('../models/TimeSlot');
const Enrollment = require('../models/Enrollment');
const TrainerDayStatus = require('../models/TrainerDayStatus');
const TrainerSlotStatus = require('../models/TrainerSlotStatus');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const [member, trainer, day] = await Promise.all([
    User.findOne({ role: 'MEMBER' }),
    User.findOne({ role: 'TRAINER' }),
    TrainingDate.findOne({ status: 'Active' }).sort({ date: 1 })
  ]);

  if (!member || !trainer || !day) {
    console.log('Thiếu dữ liệu MEMBER/TRAINER/TRAINING_DATE để debug.');
    process.exit(0);
  }

  const slots = await TimeSlot.find().sort({ startTime: 1 });
  const enrollment = await Enrollment.findOne({ memberId: member._id, trainerId: trainer._id, remainingSessions: { $gt: 0 } });
  const dayStatus = await TrainerDayStatus.findOne({ trainerId: trainer._id, trainingDateId: day._id });
  const slotStatuses = await TrainerSlotStatus.find({ trainerId: trainer._id, trainingDateId: day._id });
  const slotMap = {};
  slotStatuses.forEach((s) => { slotMap[s.timeSlotId.toString()] = s.status; });

  console.log('=== DEBUG PT AVAILABILITY ===');
  console.log('Member:', member.fullName, member._id.toString());
  console.log('Trainer:', trainer.fullName, trainer._id.toString());
  console.log('Day:', day.date.toISOString().slice(0, 10), 'status:', dayStatus?.status || 'Available');
  console.log('Has active enrollment (member->trainer):', !!enrollment);
  console.log('Slots:');
  slots.forEach((slot) => {
    const s = slotMap[slot._id.toString()] || 'Available';
    console.log(`- ${slot.startTime}-${slot.endTime}: ${s}`);
  });

  process.exit(0);
}

run();
