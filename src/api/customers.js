import apiClient from './client';

export const customersApi = {
  list: (params) => apiClient.get('/customers', { params }),
  get: (id) => apiClient.get(`/customers/${id}`),
  get360: (id) => apiClient.get(`/customers/${id}/360`),
  create: (payload) => apiClient.post('/customers', payload),
  update: (id, updates) => apiClient.patch(`/customers/${id}`, updates),
  addNote: (id, note) => apiClient.post(`/customers/${id}/notes`, { note }),
  toggleFollowUp: (id) => apiClient.patch(`/customers/${id}/follow-up/toggle`),
  togglePipelineCategory: (id) => apiClient.patch(`/customers/${id}/pipeline-category/toggle`),
  updateFollowUpAction: (id, action, date) => apiClient.patch(`/customers/${id}/follow-up-action`, { action, date }),
};
