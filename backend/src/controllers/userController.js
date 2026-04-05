const User = require('../models/User');
const Request = require('../models/Request');

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
  console.log('Update Profile Request:', { userId: req.user?._id, body: req.body });
  try {
    const updates = {};
    if (req.body.skillsOffered) updates.skillsOffered = req.body.skillsOffered.map(s => s.toLowerCase().trim());
    if (req.body.skillsWanted) updates.skillsWanted = req.body.skillsWanted.map(s => s.toLowerCase().trim());
    if (req.body.experienceLevel) updates.experienceLevel = req.body.experienceLevel;
    if (req.body.availability) updates.availability = req.body.availability.map(s => s.toLowerCase().trim());
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Backend Update Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get aggregated profile for a user
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user._id);
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const requests = await Request.find({ $or: [{ sender: userId }, { receiver: userId }] })
      .populate('sender receiver', 'name');

    res.json({ user, requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  getUserProfile
};

