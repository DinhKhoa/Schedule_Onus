const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TrainingDate = require('../models/TrainingDate');

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfCurrentWeek(now) {
  const d = startOfDay(now);
  const day = d.getDay(); // 0=Sun
  const diffToSunday = 7 - day;
  d.setDate(d.getDate() + (day === 0 ? 0 : diffToSunday));
  d.setHours(23, 59, 59, 999);
  return d;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const from = new Date('2026-04-01T00:00:00');
  const to = endOfCurrentWeek(new Date());

  if (to < from) {
    console.log('Khoảng ngày không hợp lệ.');
    process.exit(0);
  }

  let created = 0;
  let existed = 0;

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const day = startOfDay(d);
    const exists = await TrainingDate.findOne({
      date: {
        $gte: day,
        $lte: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999)
      }
    });

    if (exists) {
      existed += 1;
      continue;
    }

    await TrainingDate.create({ date: day, status: 'Active' });
    created += 1;
  }

  console.log('=== MOCK TRAINING DATES DONE ===');
  console.log('From:', from.toISOString().slice(0, 10));
  console.log('To:', to.toISOString().slice(0, 10));
  console.log('Created:', created);
  console.log('Already existed:', existed);

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
