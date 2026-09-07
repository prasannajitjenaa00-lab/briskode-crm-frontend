import apiClient from './client';

export const notificationsApi = {
  list: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  clear: (id) => apiClient.delete(`/notifications/${id}`),
};
