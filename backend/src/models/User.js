const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsOffered: [{ type: String, lowercase: true, trim: true }],
  skillsWanted: [{ type: String, lowercase: true, trim: true }],
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Beginner' },
  availability: [{ type: String, lowercase: true, trim: true }],
  rating: { type: Number, default: 0 },
  avatar: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
