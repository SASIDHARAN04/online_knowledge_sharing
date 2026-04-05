const User = require('../models/User');
const Match = require('../models/Match');

/**
 * Match Controller
 * Handles logic for finding compatible users for skill exchange
 */

// Find matching users based on skills
const findMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Normalize skills to lowercase for matching
    const wantedSkills = (currentUser.skillsWanted || []).map(s => s.toLowerCase());
    const offeredSkills = (currentUser.skillsOffered || []).map(s => s.toLowerCase());

    const potentialMatches = await User.find({
      _id: { $ne: userId },
      $or: [
        { skillsOffered: { $in: wantedSkills } },
        { skillsWanted: { $in: offeredSkills } }
      ]
    }).select('-password');

    // Calculate match score
    const scoredMatches = potentialMatches.map(user => {
      const offeredMatch = user.skillsOffered.filter(skill => currentUser.skillsWanted.includes(skill));
      const wantedMatch = user.skillsWanted.filter(skill => currentUser.skillsOffered.includes(skill));
      
      const score = (offeredMatch.length + wantedMatch.length) * 10; // Simple scoring
      
      return {
        user: {
          id: user._id,
          name: user.name,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          experienceLevel: user.experienceLevel,
          rating: user.rating,
          avatar: user.avatar
        },
        matchedSkills: {
          theyCanTeachYou: offeredMatch,
          youCanTeachThem: wantedMatch
        },
        score
      };
    }).sort((a, b) => b.score - a.score); // Sort by highest score first

    res.json({ matches: scoredMatches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  findMatches
};
