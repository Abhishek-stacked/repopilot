import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('repopilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Repository endpoints
export const repoApi = {
  list: () => api.get('/repos'),
  get: (id) => api.get(`/repos/${id}`),
  connect: (data) => api.post('/repos', data),
  triggerIndex: (id) => api.post(`/repos/${id}/index`),
  listGitHubAccessible: () => api.get('/repos/github/accessible'),
};

// Chat endpoints
export const chatApi = {
  listSessions: (repoId) => api.get('/chat/sessions', { params: { repoId } }),
  createSession: (data) => api.post('/chat/sessions', data),
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId, content) => api.post(`/chat/sessions/${sessionId}/messages`, { content }),
};

// AI Intelligence endpoints
export const intelligenceApi = {
  runReview: (repoId) => api.post(`/repos/${repoId}/review`),
  generateDocs: (repoId, docType) => api.post(`/repos/${repoId}/docs`, { docType }),
  generateTests: (repoId, data) => api.post(`/repos/${repoId}/tests`, data),
};

// User & Billing endpoints
export const userApi = {
  updateProfile: (data) => api.put('/user/profile', data),
  upgradePlan: (plan) => api.post('/user/plan', { plan }),
  getUsage: () => api.get('/user/usage'),
};
