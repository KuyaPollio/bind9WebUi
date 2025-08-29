import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/setup') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          toast.error(data.error || 'Access forbidden');
          break;
          
        case 404:
          toast.error(data.error || 'Resource not found');
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          if (data.error) {
            toast.error(data.error);
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  setupRequired: () => api.get('/auth/setup-required'),
  setup: (data) => api.post('/auth/setup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const configAPI = {
  getFiles: () => api.get('/config/files'),
  getFile: (filename) => api.get(`/config/files/${filename}`),
  updateFile: (filename, content) => api.put(`/config/files/${filename}`, { content }),
  createFile: (filename, content) => api.post('/config/files', { filename, content }),
  deleteFile: (filename) => api.delete(`/config/files/${filename}`),
  validate: (content) => api.post('/config/validate', { content }),
};

export const recordsAPI = {
  getZones: () => api.get('/records/zones'),
  getZone: (filename) => api.get(`/records/zones/${filename}`),
  updateZone: (filename, content) => api.put(`/records/zones/${filename}`, { content }),
  createZone: (data) => api.post('/records/zones', data),
  deleteZone: (filename) => api.delete(`/records/zones/${filename}`),
};

export const logsAPI = {
  getBind9Logs: (params = {}) => api.get('/logs/bind9', { params }),
  getApplicationLogs: (params = {}) => api.get('/logs/application', { params }),
  getSystemLogs: (params = {}) => api.get('/logs/system', { params }),
};

export default api;
