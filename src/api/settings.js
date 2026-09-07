import apiClient from './client';

export const settingsApi = {
  get: () => apiClient.get('/settings'),
  update: (payload) => apiClient.patch('/settings', payload),
};
