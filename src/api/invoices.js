import apiClient from './client';
import config from '../config';

export const invoicesApi = {
  list: (params) => apiClient.get('/invoices', { params }),
  get: (id) => apiClient.get(`/invoices/${id}`),
  create: (payload) => apiClient.post('/invoices', payload),
  updateStatus: (id, status) => apiClient.patch(`/invoices/${id}/status`, { status }),
  remove: (id) => apiClient.delete(`/invoices/${id}`),
  downloadPdfUrl: (id) => config.api.getPdfUrl(id),
};
