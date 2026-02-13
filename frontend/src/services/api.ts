import axios, { AxiosError, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Debug: Log the baseURL being used
console.log('API baseURL:', import.meta.env.VITE_API_URL || '/api');

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug: Log the full request URL
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return data directly if response is successful
    return response.data;
  },
  (error: AxiosError<any>) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Only logout if the auth check endpoint (/api/auth/me) returns 401
      // Don't logout for other 401 errors (they might be temporary)
      if (status === 401 && error.config?.url?.includes('/auth/me')) {
        console.log('Auth check failed with 401, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');

        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }

      // Extract error message from response
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'An unexpected error occurred';

      return Promise.reject({
        status,
        message: errorMessage,
        code: data?.error?.code,
      });
    }

    // Network error
    if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    // Request setup error
    return Promise.reject({
      message: error.message || 'Request failed',
      code: 'REQUEST_ERROR',
    });
  }
);

export default api;

// Type for API error
export interface ApiError {
  status?: number;
  message: string;
  code?: string;
}

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }

  return 'An unexpected error occurred';
};
