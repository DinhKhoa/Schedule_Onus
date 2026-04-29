const mongoose = require('mongoose');

const trainerDayStatusSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['Available', 'Unavailable'],
    default: 'Available'
  }
}, {
  timestamps: true
});

trainerDayStatusSchema.index({ trainerId: 1, trainingDateId: 1 }, { unique: true });

module.exports = mongoose.model('TrainerDayStatus', trainerDayStatusSchema, 'TrainerDayStatuses');
