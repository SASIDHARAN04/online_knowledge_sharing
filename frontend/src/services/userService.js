import api from './api';

/**
 * User Service
 * Handles user-related API calls
 */

// Get all users
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data.users;
};

// Get user by ID
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.user;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.patch('/users/profile', profileData);
  return response.data.user;
};

// Get user points/wallet
export const getPointsWallet = async () => {
  const response = await api.get('/users/wallet');
  return response.data;
};
