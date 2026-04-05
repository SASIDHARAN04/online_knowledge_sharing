const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Service
 * Handles user registration, login, and token generation
 */

// Register new user
const registerUser = async (userData) => {
  const { name, email, password, skillsOffered, skillsWanted, experienceLevel, availability } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    skillsOffered: skillsOffered || [],
    skillsWanted: skillsWanted || [],
    experienceLevel: experienceLevel || 'Beginner',
    availability: availability || []
  });

  await user.save();
  return user;
};

// Login user
const loginUser = async (email, password) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
      experienceLevel: user.experienceLevel,
      availability: user.availability,
      rating: user.rating,
      avatar: user.avatar
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};
