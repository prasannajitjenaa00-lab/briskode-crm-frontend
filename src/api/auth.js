import apiClient, { getRefreshToken } from './client';

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout', { refreshToken: getRefreshToken() }),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken: refreshToken || getRefreshToken() }),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password }),
};
