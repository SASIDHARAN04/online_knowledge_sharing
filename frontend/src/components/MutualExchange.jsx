import React, { useState, useEffect } from 'react';
import { getMyExchanges, createExchange, updateExchangeStatus } from '../services/exchangeService';
import { getAllUsers } from '../services/userService';
import './MutualExchange.css';

/**
 * MutualExchange Component
 * Peer-to-peer knowledge exchange
 * Skill swap and mentoring sessions
 */
const MutualExchange = () => {
  const [exchanges, setExchanges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    providerId: '',
    skillOffered: '',
    skillRequested: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchExchanges();
    fetchUsers();
  }, []);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const data = await getMyExchanges();
      setExchanges(data);
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await createExchange(formData);
      setFormData({ providerId: '', skillOffered: '', skillRequested: '' });
      setShowForm(false);
      setMessage('Exchange request created successfully!');
      fetchExchanges();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create exchange');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleStatusUpdate = async (exchangeId, status) => {
    try {
      await updateExchangeStatus(exchangeId, status);
      setMessage(`Exchange ${status.toLowerCase()} successfully!`);
      fetchExchanges();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update exchange status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading exchanges...</div>;
  }

  return (
    <div className="mutual-exchange">
      <div className="exchange-header">
        <h2>Mutual Knowledge Exchange</h2>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Exchange'}
        </button>
      </div>

      {showForm && (
        <form className="exchange-form" onSubmit={handleSubmit}>
          <h3>Create Exchange Request</h3>
          <select
            value={formData.providerId}
            onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
            required
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Skill I'm Offering"
            value={formData.skillOffered}
            onChange={(e) => setFormData({ ...formData, skillOffered: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Skill I Want to Learn"
            value={formData.skillRequested}
            onChange={(e) => setFormData({ ...formData, skillRequested: e.target.value })}
            required
          />
          <button type="submit" className="submit-btn">Create Exchange</button>
        </form>
      )}

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="exchanges-list">
        {exchanges.length > 0 ? (
          exchanges.map((exchange) => (
            <div key={exchange._id} className="exchange-card">
              <div className="exchange-header-card">
                <div>
                  <h4>
                    {exchange.requester.username} ↔ {exchange.provider.username}
                  </h4>
                  <span className={`status-badge ${exchange.status.toLowerCase()}`}>
                    {exchange.status}
                  </span>
                </div>
              </div>
              <div className="exchange-details">
                <div className="skill-item">
                  <span className="label">Offering:</span>
                  <span className="value">{exchange.skillOffered}</span>
                </div>
                <div className="skill-item">
                  <span className="label">Requesting:</span>
                  <span className="value">{exchange.skillRequested}</span>
                </div>
              </div>
              {exchange.status === 'Pending' && exchange.provider._id && (
                <div className="exchange-actions">
                  <button
                    className="accept-btn"
                    onClick={() => handleStatusUpdate(exchange._id, 'Accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusUpdate(exchange._id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
              {exchange.status === 'Accepted' && (
                <button
                  className="complete-btn"
                  onClick={() => handleStatusUpdate(exchange._id, 'Completed')}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="no-exchanges">
            <p>No exchanges yet.</p>
            <p>Create an exchange request to swap skills with others!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MutualExchange;
