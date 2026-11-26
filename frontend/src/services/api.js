import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data;
      let message = 'Request failed';
      if (typeof data === 'string' && data.trim()) {
        message = data;
      } else if (data && typeof data === 'object') {
        message = data.error || data.message || (data.status ? `Server error (status ${data.status})` : 'Request failed');
      } else if (error.response.status) {
        message = `Server error (${error.response.status})`;
      }
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error(`Cannot connect to the backend. Please check your network or server status.`));
    }

    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

export default api;
