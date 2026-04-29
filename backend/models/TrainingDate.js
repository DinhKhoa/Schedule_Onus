const mongoose = require('mongoose');

const trainingDateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

trainingDateSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('TrainingDate', trainingDateSchema, 'TrainingDates');
