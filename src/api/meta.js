import apiClient from './client';

export const metaApi = {
  connect: (shortLivedToken) => apiClient.post('/meta/connect', { shortLivedToken }),
  listPages: () => apiClient.get('/meta/pages'),
  syncForms: (pageId) => apiClient.post(`/meta/pages/${pageId}/sync-forms`),
  listForms: () => apiClient.get('/meta/forms'),
  updateForm: (id, updates) => apiClient.patch(`/meta/forms/${id}`, updates),
  listWebhookLogs: () => apiClient.get('/meta/webhook-logs'),
  retryWebhookLog: (id) => apiClient.post(`/meta/webhook-logs/${id}/retry`),
};
