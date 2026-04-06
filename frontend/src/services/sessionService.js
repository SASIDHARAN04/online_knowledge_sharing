import api from './api';

export const createVideoSession = async (receiverId, skillExchange) => {
  const response = await api.post('/api/sessions/create', { receiverId, skillExchange });
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/api/sessions/${sessionId}`);
  return response.data.session;
};

export const joinVideoSession = async (sessionId) => {
  const response = await api.get(`/api/sessions/join/${sessionId}`);
  return response.data;
};

export const createRealtimeSession = async (receiverId) => {
    const response = await api.post('/api/session/create', { receiverId });
    return response.data.session;
};
