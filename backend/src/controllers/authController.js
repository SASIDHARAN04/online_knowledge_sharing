const authService = require('../services/authService');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

// Register new user
const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    
    // Generate token for immediate login
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        experienceLevel: user.experienceLevel,
        availability: user.availability,
        rating: user.rating
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
