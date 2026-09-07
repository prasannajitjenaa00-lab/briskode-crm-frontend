import apiClient from './client';

export const leadsApi = {
  list: (params) => apiClient.get('/leads', { params }),
  get: (id) => apiClient.get(`/leads/${id}`),
  create: (payload) => apiClient.post('/leads', payload),
  updateStatus: (id, status, note) => apiClient.patch(`/leads/${id}/status`, { status, note }),
  assign: (id, adminId) => apiClient.patch(`/leads/${id}/assign`, { adminId }),
  toggleFollowUp: (id) => apiClient.patch(`/leads/${id}/follow-up/toggle`),
  togglePipelineCategory: (id) => apiClient.patch(`/leads/${id}/pipeline-category/toggle`),
  updateFollowUpAction: (id, action, date) => apiClient.patch(`/leads/${id}/follow-up-action`, { action, date }),
  addNote: (id, note) => apiClient.post(`/leads/${id}/notes`, { note }),
  exportCSV: (params) => apiClient.get('/leads/export/csv', { params, responseType: 'blob' }),
};
