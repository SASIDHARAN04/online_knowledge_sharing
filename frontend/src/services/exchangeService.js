import api from './api';

/**
 * Exchange Service
 * Handles mutual knowledge exchange API calls
 */

// Get all exchanges
export const getAllExchanges = async () => {
  const response = await api.get('/exchanges');
  return response.data.exchanges;
};

// Get user's exchanges
export const getMyExchanges = async () => {
  const response = await api.get('/exchanges/my-exchanges');
  return response.data.exchanges;
};

// Create exchange request
export const createExchange = async (exchangeData) => {
  const response = await api.post('/exchanges', exchangeData);
  return response.data.exchange;
};

// Update exchange status
export const updateExchangeStatus = async (exchangeId, status) => {
  const response = await api.patch(`/exchanges/${exchangeId}/status`, { status });
  return response.data.exchange;
};
