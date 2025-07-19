import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://tasker-client-manager.vercel.app/api'
    : 'http://localhost:3000/api');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Client API functions
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: id => api.get(`/clients/${id}`),
  create: data => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: id => api.delete(`/clients/${id}`),
  getDashboard: id => api.get(`/clients/${id}/dashboard`)
};

// Project API functions
export const projectsAPI = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: id => api.get(`/projects/${id}`),
  create: data => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: id => api.delete(`/projects/${id}`),
  getStats: id => api.get(`/projects/${id}/stats`)
};

// Task API functions
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: id => api.get(`/tasks/${id}`),
  create: data => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: id => api.delete(`/tasks/${id}`),
  schedule: (id, scheduleData) => api.patch(`/tasks/${id}/schedule`, scheduleData),
  complete: id => api.patch(`/tasks/${id}/complete`),
  getOverdue: () => api.get('/tasks/overdue'),
  getScheduled: (params = {}) => api.get('/tasks/scheduled', { params })
};

// Event API functions
export const eventsAPI = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: id => api.get(`/events/${id}`),
  create: data => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: id => api.delete(`/events/${id}`),
  getUpcoming: (params = {}) => api.get('/events/upcoming', { params }),
  checkConflicts: params => api.get('/events/conflicts', { params }),
  getCalendarMonth: (year, month) => api.get(`/events/calendar/${year}/${month}`)
};

// Calendar API functions
export const calendarAPI = {
  getView: (params = {}) => api.get('/calendar/view', { params }),
  getWorkload: (params = {}) => api.get('/calendar/workload', { params }),
  getDashboard: () => api.get('/calendar/dashboard')
};

// Generic API helper functions
export const apiHelpers = {
  handleError: error => {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        success: false,
        error: data.error || `Server error (${status})`,
        details: data.details || null
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        success: false,
        error: 'Network error - please check your connection'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  },

  // Wrapper for API calls with error handling
  safeApiCall: async apiFunction => {
    try {
      const response = await apiFunction();
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return apiHelpers.handleError(error);
    }
  },

  // Format dates for API
  formatDate: date => {
    return new Date(date).toISOString();
  },

  // Parse API dates
  parseDate: dateString => {
    return new Date(dateString);
  }
};

export default api;
