import api from './api';

export const findMatches = async () => {
  const response = await api.get('/match/find');
  return response.data.matches;
};

export const sendMatchRequest = async (receiverId, skillExchange) => {
  const response = await api.post('/requests', { receiverId, skillExchange });
  return response.data;
};
