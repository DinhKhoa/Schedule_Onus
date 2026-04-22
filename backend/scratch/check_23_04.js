const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const NgayTap = require('../models/NgayTap');
const GioTap = require('../models/GioTap');
const DangKyKhoaTap = require('../models/DangKyKhoaTap');
const LichTap = require('../models/LichTap');
const KhoaTap = require('../models/KhoaTap');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find Thắng
    const pt = await User.findOne({ hoTen: /Thắng/i });
    console.log('PT Thắng ID:', pt?._id);

    // Find Day 23/04
    const startDate = new Date('2026-04-23T00:00:00.000Z');
    const endDate = new Date('2026-04-24T00:00:00.000Z');
    const day = await NgayTap.findOne({ 
      ngay: { $gte: startDate, $lt: endDate } 
    });
    console.log('Day record:', day);

    if (day) {
      const schedules = await LichTap.find({ ngayTapId: day._id })
        .populate('gioTapId')
        .populate({
          path: 'dangKyKhoaTapId',
          populate: { path: 'ptId' }
        });
      
      console.log('Schedules found:', JSON.stringify(schedules, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
