import apiClient from './client';

export const announcementsApi = {
  list: () => apiClient.get('/announcements'),
  create: (payload) => apiClient.post('/announcements', payload),
  acknowledge: (id) => apiClient.patch(`/announcements/${id}/acknowledge`),
  remove: (id) => apiClient.delete(`/announcements/${id}`),
};
