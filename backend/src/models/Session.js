const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['document', 'youtube'],
        required: true
    },
    url: { type: String, required: true },
    title: { type: String },
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    status: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    sharedResources: [resourceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
