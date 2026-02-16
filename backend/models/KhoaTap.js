const mongoose = require('mongoose');

const khoaTapSchema = new mongoose.Schema({
  tenKhoaTap: {
    type: String,
    required: [true, 'Tên khóa tập là bắt buộc'],
    unique: true,
    trim: true
  },
  soBuoi: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KhoaTap', khoaTapSchema, 'KhoaTap');
