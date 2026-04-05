import api from './api';

export const getMessages = async (userId) => {
  const response = await api.get(`/chat/${userId}`);
  return response.data.messages;
};
