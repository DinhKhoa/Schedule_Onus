const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  trainingDateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingDate',
    required: true
  },
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PendingTrainerConfirm', 'Booked', 'Completed', 'Cancelled', 'Rejected'],
    default: 'PendingTrainerConfirm'
  }
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ enrollmentId: 1 });
bookingSchema.index({ trainingDateId: 1 });
bookingSchema.index({ timeSlotId: 1 });

// Compound Unique Index: One PT cannot teach 2 people in the same slot
bookingSchema.index(
  { trainerId: 1, trainingDateId: 1, timeSlotId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['PendingTrainerConfirm', 'Booked'] } } 
  }
);

// Compound Unique Index: One Member cannot have 2 sessions in the same slot
bookingSchema.index(
  { memberId: 1, trainingDateId: 1, timeSlotId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['PendingTrainerConfirm', 'Booked'] } } 
  }
);

module.exports = mongoose.model('Booking', bookingSchema, 'Bookings');
