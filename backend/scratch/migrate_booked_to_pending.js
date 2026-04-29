const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Booking = require('../models/Booking');
require('../models/TrainingDate');
require('../models/TimeSlot');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const now = new Date();

  const candidates = await Booking.find({ status: 'Booked' })
    .populate('trainingDateId')
    .populate('timeSlotId');

  let updated = 0;
  let skippedPast = 0;

  for (const booking of candidates) {
    if (!booking.trainingDateId?.date || !booking.timeSlotId?.startTime) continue;
    const start = new Date(booking.trainingDateId.date);
    const [h, m] = booking.timeSlotId.startTime.split(':');
    start.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);

    if (start <= now) {
      skippedPast += 1;
      continue;
    }

    booking.status = 'PendingTrainerConfirm';
    await booking.save();
    updated += 1;
  }

  console.log('=== MIGRATION DONE ===');
  console.log('Updated to PendingTrainerConfirm:', updated);
  console.log('Skipped (past/ongoing):', skippedPast);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
