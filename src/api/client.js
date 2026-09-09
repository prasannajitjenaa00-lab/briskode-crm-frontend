import axios from 'axios';
import { normalizeIds } from './normalize';
import config from '../config';

const BASE_URL = config.api.baseUrl;
const STORAGE_PREFIX = config.app?.storagePrefix || 'meta_crm_';
const TOKEN_KEY = `${STORAGE_PREFIX}access_token`;
const REFRESH_KEY = `${STORAGE_PREFIX}refresh_token`;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let accessToken = localStorage.getItem(TOKEN_KEY) || null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAccessToken = () => accessToken || localStorage.getItem(TOKEN_KEY);

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const clearAuthStorage = () => {
  accessToken = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(`${STORAGE_PREFIX}user`);
};

export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

apiClient.interceptors.request.use((config) => {
  const currentToken = accessToken || localStorage.getItem(TOKEN_KEY);
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Auto-refresh the access token once on a 401, then retry the original request.
let refreshPromise = null;

apiClient.interceptors.response.use(
  (res) => {
    // Mirror MongoDB's `_id` as `id` on every response so existing
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
          const storedRefresh = getRefreshToken();
          // Use raw axios to prevent re-entering interceptor loop
          refreshPromise = axios
            .post(
              `${BASE_URL}/auth/refresh`,
              { refreshToken: storedRefresh },
              { withCredentials: true }
            )
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;
        if (newAccessToken) setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        clearAuthStorage();
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
