const User = require('../models/User');

/**
 * User Controller
 * Handles user-related operations
 */

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { skills, role, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (skills) user.skills = skills;
    if (role) user.role = role;
    if (avatar) user.avatar = avatar;

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user points/wallet
const getPointsWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points username');
    res.json({
      points: user.points,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  getPointsWallet
};
