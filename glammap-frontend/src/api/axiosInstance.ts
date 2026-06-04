// src/api/axiosInstance.ts
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Use environment variable for API base URL, prefixed with VITE_ for Vite compatibility
// Ensure you have a .env file with VITE_REACT_APP_API_URL=<your_api_url>
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // needed so the httpOnly refresh cookie is sent
});

// Request Interceptor: Add Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Network Error: Could not send request.');
    return Promise.reject(error);
  }
);

// Tracks whether a token refresh is already in flight to avoid multiple
// concurrent refresh calls when several requests 401 at the same time.
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token as string);
    }
  });
  pendingQueue = [];
}

function clearSession() {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
  window.location.href = '/login';
}

// Response Interceptor: Handle global API errors and auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');

    // Auto-refresh: only when 401, not already retried, and not the refresh/login endpoints
    if (is401 && !originalRequest?._retry && !isRefreshEndpoint && !isLoginEndpoint) {
      if (isRefreshing) {
        // Queue the request while a refresh is already in flight
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest!);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest!._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ token: string }>('/auth/refresh');
        const newToken = data.token;

        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        if (originalRequest) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Generic error handling for all other errors
    if (error.response) {
      const errorMessage = error.response.data?.message || 'An unexpected error occurred.';
      // Don't double-toast on 401 since the refresh logic handles it silently
      if (error.response.status !== 401) {
        toast.error(errorMessage);
      }
    } else if (error.request) {
      toast.error('Network Error: Please check your connection.');
    } else {
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
