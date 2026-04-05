import api from './api';

export const getMessages = async (userId) => {
  const response = await api.get(`/api/chat/${userId}`);
  return response.data.messages;
};
