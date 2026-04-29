const mongoose = require('mongoose');

const coursePackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên khóa tập là bắt buộc'],
    unique: true,
    trim: true
  },
  totalSessions: {
    type: Number,
    required: true,
    min: [1, 'Số buổi phải ít nhất 1'],
    max: [40, 'Số buổi không được quá 40']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CoursePackage', coursePackageSchema, 'CoursePackages');
