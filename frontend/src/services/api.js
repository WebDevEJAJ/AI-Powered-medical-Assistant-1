import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  const userId = localStorage.getItem('userId');

  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }

  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
