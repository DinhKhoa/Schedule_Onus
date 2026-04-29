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
  status: {
    type: String,
    enum: ['PendingTrainerConfirm', 'Booked', 'Completed', 'Cancelled', 'Rejected'],
    default: 'PendingTrainerConfirm'
  }
}, {
  timestamps: true
});

bookingSchema.index({ enrollmentId: 1 });
bookingSchema.index({ trainingDateId: 1 });
bookingSchema.index({ timeSlotId: 1 });
bookingSchema.index({ timeSlotId: 1, trainingDateId: 1 });

module.exports = mongoose.model('Booking', bookingSchema, 'Bookings');
