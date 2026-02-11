import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import './ProfileCard.css';

/**
 * ProfileCard Component
 * Displays user profile details, skills, role, and points summary
 */
const ProfileCard = () => {
  const { user, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    const updatedSkills = [...skills, newSkill.trim()];
    setLoading(true);
    setMessage('');

    try {
      await updateProfile({ skills: updatedSkills });
      setSkills(updatedSkills);
      setNewSkill('');
      setMessage('Skill added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setLoading(true);
    setMessage('');

    try {
      await updateProfile({ skills: updatedSkills });
      setSkills(updatedSkills);
      setMessage('Skill removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
          <h2>{user.username}</h2>
          <p className="user-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-label">Role:</span>
          <span className="detail-value badge">{user.role || 'Learner'}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Points:</span>
          <span className="detail-value points">{user.points || v}</span>
        </div>

        <div className="skills-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button
                    className="remove-skill"
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="no-skills">No skills added yet</p>
            )}
          </div>

          <div className="add-skill-form">
            <input
              type="text"
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              className="skill-input"
            />
            <button
              onClick={handleAddSkill}
              disabled={loading || !newSkill.trim()}
              className="add-skill-btn"
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
