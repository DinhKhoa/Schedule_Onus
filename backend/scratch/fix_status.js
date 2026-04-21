const mongoose = require('mongoose');
require('dotenv').config();
const GioTap = require('../models/GioTap');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const res1 = await GioTap.updateMany({ trangThai: 'Trong' }, { $set: { trangThai: 'HoatDong' } });
  const res2 = await GioTap.updateMany({ trangThai: 'Tat' }, { $set: { trangThai: 'NgungHoatDong' } });
  
  console.log(`Migration complete. Fixed ${res1.modifiedCount} "Trong" and ${res2.modifiedCount} "Tat".`);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
