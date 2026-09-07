import apiClient from './client';

export const campaignsApi = {
  list: (params) => apiClient.get('/campaigns', { params }),
  get: (id) => apiClient.get(`/campaigns/${id}`),
  create: (payload) => apiClient.post('/campaigns', payload),
  update: (id, updates) => apiClient.patch(`/campaigns/${id}`, updates),
  toggleStatus: (id) => apiClient.patch(`/campaigns/${id}/toggle-status`),
  remove: (id) => apiClient.delete(`/campaigns/${id}`),
};
