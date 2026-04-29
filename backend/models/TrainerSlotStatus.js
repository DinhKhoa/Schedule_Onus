const mongoose = require('mongoose');

const trainerSlotStatusSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainingDateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingDate',
    required: true
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  }
}, {
  timestamps: true
});

trainerSlotStatusSchema.index({ trainerId: 1, trainingDateId: 1, timeSlotId: 1 }, { unique: true });

module.exports = mongoose.model('TrainerSlotStatus', trainerSlotStatusSchema, 'TrainerSlotStatuses');
