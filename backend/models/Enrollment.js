const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoursePackage',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: { type: Date, default: Date.now },
  totalSessions: { type: Number, required: true },
  remainingSessions: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

enrollmentSchema.index({ memberId: 1, remainingSessions: 1 });
enrollmentSchema.index({ trainerId: 1 });
enrollmentSchema.index({ packageId: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema, 'Enrollments');
