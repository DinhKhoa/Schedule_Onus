const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const users = await User.find({ fullName: /Thùy Dung/i });
  console.log('Users found with name Thùy Dung:', users.map(u => ({
    id: u._id,
    fullName: u.fullName,
    username: u.username,
    phoneNumber: u.phoneNumber
  })));
  
  process.exit(0);
}

debug();
