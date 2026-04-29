const mongoose = require('mongoose');

const slotStatusSchema = new mongoose.Schema({
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
    enum: ['Active', 'Inactive'],
    default: 'Inactive'
  }
}, {
  timestamps: true
});

slotStatusSchema.index({ trainingDateId: 1, timeSlotId: 1 }, { unique: true });

module.exports = mongoose.model('SlotStatus', slotStatusSchema, 'SlotStatuses');
