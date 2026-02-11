import api from './api';

/**
 * Request Service
 * Handles teaching/learning request API calls
 */

// Get all requests
export const getAllRequests = async () => {
  const response = await api.get('/requests');
  return response.data.requests;
};

// Get user's requests (incoming and outgoing)
export const getMyRequests = async () => {
  const response = await api.get('/requests/my-requests');
  return response.data;
};

// Create request
export const createRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data.request;
};

// Update request status
export const updateRequestStatus = async (requestId, status) => {
  const response = await api.patch(`/requests/${requestId}/status`, { status });
  return response.data.request;
};
