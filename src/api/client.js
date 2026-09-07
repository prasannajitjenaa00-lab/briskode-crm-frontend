import axios from 'axios';
import { normalizeIds } from './normalize';
import config from '../config';

const BASE_URL = config.api.baseUrl;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie
});

let accessToken = null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh the access token once on a 401, then retry the original request.
let refreshPromise = null;

apiClient.interceptors.response.use(
  (res) => {
    // Mirror MongoDB's `_id` as `id` on every response so the existing
    // components (built against mock data using `.id`) work unmodified.
    if (res.data && typeof res.data === 'object' && 'data' in res.data) {
      res.data.data = normalizeIds(res.data.data);
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    if (!original) {
      return Promise.reject(error);
    }

    // Do NOT intercept auth endpoints (refresh, login, logout, etc.)
    const isAuthEndpoint = original.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          // Use raw axios to prevent re-entering interceptor loop
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        const newAccessToken = data?.data?.accessToken;
        setAccessToken(newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
