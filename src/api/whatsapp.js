import apiClient from './client';

export const whatsappApi = {
  getConversation: (phone) => apiClient.get(`/whatsapp/conversations/${phone}`),
  send: (payload) => apiClient.post('/whatsapp/send', payload),
  listBroadcasts: (params) => apiClient.get('/whatsapp/broadcasts', { params }),
  createBroadcast: (payload) => apiClient.post('/whatsapp/broadcasts', payload),
};
