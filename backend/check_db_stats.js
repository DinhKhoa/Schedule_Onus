const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});
const GioTap = require('./models/GioTap');
const NgayTap = require('./models/NgayTap');

async function checkDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const gios = await GioTap.find({}, 'trangThai');
  const ngays = await NgayTap.find({}, 'trangThai');
  
  console.log('--- CURRENT DB SNAPSHOT ---');
  const gioStats = {};
  gios.forEach(g => gioStats[g.trangThai] = (gioStats[g.trangThai] || 0) + 1);
  console.log('GioTap:', gioStats);

  const ngayStats = {};
  ngays.forEach(n => ngayStats[n.trangThai] = (ngayStats[n.trangThai] || 0) + 1);
  console.log('NgayTap:', ngayStats);
  
  process.exit(0);
}

checkDB();
