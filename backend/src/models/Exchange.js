const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillOffered: { type: String, required: true },
    skillRequested: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Exchange', exchangeSchema);
