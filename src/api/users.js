import apiClient from './client';

export const usersApi = {
  list: () => apiClient.get('/users'),
  create: (payload) => apiClient.post('/users', payload),
  update: (id, updates) => apiClient.patch(`/users/${id}`, updates),
  remove: (id, reassignTo) => apiClient.delete(`/users/${id}`, { params: { reassignTo } }),
};
