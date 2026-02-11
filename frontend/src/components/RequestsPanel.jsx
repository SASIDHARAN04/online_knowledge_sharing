import React, { useState, useEffect } from 'react';
import { getMyRequests, createRequest, updateRequestStatus } from '../services/requestService';
import { getAllUsers } from '../services/userService';
import './RequestsPanel.css';

/**
 * RequestsPanel Component
 * Incoming and outgoing learning/teaching requests
 * Accept or reject actions
 */
const RequestsPanel = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: '',
    type: 'Teach',
    details: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyRequests();
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
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
      await createRequest(formData);
      setFormData({ recipientId: '', type: 'Teach', details: '' });
      setShowForm(false);
      setMessage('Request sent successfully!');
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send request');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      setMessage(`Request ${status.toLowerCase()} successfully!`);
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update request status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="requests-panel">
      <div className="requests-header">
        <h2>Requests</h2>
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <form className="request-form" onSubmit={handleSubmit}>
          <h3>Create Request</h3>
          <select
            value={formData.recipientId}
            onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
            required
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="Teach">Request to Teach</option>
            <option value="Learn">Request to Learn</option>
            <option value="Exchange">Request Exchange</option>
          </select>
          <textarea
            placeholder="Request Details"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            rows="4"
            required
          />
          <button type="submit" className="submit-btn">Send Request</button>
        </form>
      )}

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="requests-container">
        <div className="requests-section">
          <h3>Incoming Requests</h3>
          {incoming.length > 0 ? (
            <div className="requests-list">
              {incoming.map((request) => (
                <div key={request._id} className="request-card incoming">
                  <div className="request-header">
                    <h4>From: {request.sender?.username || 'Unknown'}</h4>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-type">
                    Type: <strong>{request.type}</strong>
                  </div>
                  <p className="request-details">{request.details}</p>
                  {request.status === 'Pending' && (
                    <div className="request-actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleStatusUpdate(request._id, 'Accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-requests">No incoming requests</div>
          )}
        </div>

        <div className="requests-section">
          <h3>Outgoing Requests</h3>
          {outgoing.length > 0 ? (
            <div className="requests-list">
              {outgoing.map((request) => (
                <div key={request._id} className="request-card outgoing">
                  <div className="request-header">
                    <h4>To: {request.recipient?.username || 'Unknown'}</h4>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-type">
                    Type: <strong>{request.type}</strong>
                  </div>
                  <p className="request-details">{request.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-requests">No outgoing requests</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPanel;
