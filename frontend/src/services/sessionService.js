import api from './api';

export const createVideoSession = async (receiverId, skillExchange) => {
  const response = await api.post('/sessions/create', { receiverId, skillExchange });
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data.session;
};

export const joinVideoSession = async (sessionId) => {
  const response = await api.get(`/sessions/join/${sessionId}`);
  return response.data;
};
