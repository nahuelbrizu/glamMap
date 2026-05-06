// src/api/axiosInstance.ts
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Use environment variable for API base URL, prefixed with VITE_ for Vite compatibility
// Ensure you have a .env file with VITE_REACT_APP_API_URL=<your_api_url>
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
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
    // Request error handling (e.g., network issues before request is sent)
    toast.error('Network Error: Could not send request.');
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global API errors (e.g., Unauthorized, Server Error)
api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error: AxiosError<any>) => {
    // Handle specific error codes
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || 'An unexpected error occurred.';
      toast.error(errorMessage);

      // Example: Global unauthorized logout suggestion
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn('Unauthorized access detected. Please log in again.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network Error: Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An error occurred. Please try again.');
    }
    // Reject the promise to allow individual component catch blocks to execute if needed
    return Promise.reject(error);
  }
);

export default api;
