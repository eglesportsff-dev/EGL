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
      const message = error.response.data?.error || error.response.data?.message || 'Request failed';
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error(`Cannot connect to the backend. Please check the API URL: ${apiBaseUrl}.`));
    }

    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

export default api;
