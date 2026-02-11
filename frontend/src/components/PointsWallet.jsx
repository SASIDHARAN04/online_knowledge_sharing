import React, { useState, useEffect } from 'react';
import { getPointsWallet } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import './PointsWallet.css';

/**
 * PointsWallet Component
 * Earned and spent points
 * Knowledge contribution rewards
 */
const PointsWallet = () => {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await getPointsWallet();
      setWalletData(data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  const points = walletData?.points || user?.points || 0;

  return (
    <div className="points-wallet">
      <div className="wallet-header">
        <h2>Points Wallet</h2>
      </div>

      <div className="wallet-card">
        <div className="points-display">
          <div className="points-icon">💰</div>
          <div className="points-value">{points}</div>
          <div className="points-label">Total Points</div>
        </div>

        <div className="points-info">
          <h3>How to Earn Points</h3>
          <ul className="earn-list">
            <li>
              <span className="icon">📚</span>
              <div>
                <strong>Create a Course:</strong> Earn 20 points when someone enrolls
              </div>
            </li>
            <li>
              <span className="icon">🎓</span>
              <div>
                <strong>Complete Learning:</strong> Earn 15 points per completed course
              </div>
            </li>
            <li>
              <span className="icon">🤝</span>
              <div>
                <strong>Mutual Exchange:</strong> Earn 10 points per completed exchange
              </div>
            </li>
            <li>
              <span className="icon">📬</span>
              <div>
                <strong>Accept Requests:</strong> Earn 15 points per accepted teaching/learning request
              </div>
            </li>
          </ul>
        </div>

        <div className="points-usage">
          <h3>How to Use Points</h3>
          <ul className="usage-list">
            <li>
              <span className="icon">🎯</span>
              <div>
                <strong>Enroll in Courses:</strong> Use points to enroll in premium courses
              </div>
            </li>
            <li>
              <span className="icon">⭐</span>
              <div>
                <strong>Unlock Features:</strong> Access exclusive content and features
              </div>
            </li>
          </ul>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-item">
            <span className="activity-icon">+</span>
            <div className="activity-details">
              <p>Welcome Bonus</p>
              <span className="activity-date">Account created</span>
            </div>
            <span className="activity-points">+0</span>
          </div>
          <p className="activity-note">Your transaction history will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default PointsWallet;
