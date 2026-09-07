import apiClient from './client';

export const dashboardApi = {
  kpis: () => apiClient.get('/dashboard/kpis'),
  leadAnalytics: () => apiClient.get('/dashboard/lead-analytics'),
  campaignAnalytics: () => apiClient.get('/dashboard/campaign-analytics'),
  revenueReport: (months) => apiClient.get('/dashboard/revenue-report', { params: { months } }),
};
