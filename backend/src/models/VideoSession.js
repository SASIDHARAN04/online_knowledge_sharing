const mongoose = require('mongoose');

const videoSessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  skillExchange: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  meetingLink: {
    type: String,
    unique: true
  },
  sharedResources: [{
    type: { type: String, enum: ['document', 'youtube'], required: true },
    url: { type: String, required: true },
    title: { type: String },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('VideoSession', videoSessionSchema);
