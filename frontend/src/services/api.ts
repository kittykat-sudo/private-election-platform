import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { tenantId: string; email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  
  registerAdmin: (data: { tenantId: string; email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register-admin', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  updateProfile: (data: { name: string; email: string }) =>
    api.put('/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
};

// Elections API
export const electionsAPI = {
  getAll: () => api.get('/elections'),
  
  getById: (id: string) => api.get(`/elections/${id}`),
  
  create: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    candidates: Array<{ name: string; description: string }>;
    isPublic: boolean;
  }) => api.post('/elections', data),
  
  update: (id: string, data: any) => api.put(`/elections/${id}`, data),
  
  delete: (id: string) => api.delete(`/elections/${id}`),
  
  addVoters: (id: string, voterEmails: string[]) =>
    api.post(`/elections/${id}/voters`, { voterEmails }),
  
  removeVoter: (electionId: string, voterId: string) =>
    api.delete(`/elections/${electionId}/voters/${voterId}`),
  
  getResults: (id: string) => api.get(`/elections/${id}/results`),
};

// Votes API
export const votesAPI = {
  cast: (data: { electionId: string; candidate: string }) =>
    api.post('/votes', data),
  
  getMyVotes: () => api.get('/votes/my-votes'),
  
  checkVoted: (electionId: string) => api.get(`/votes/check/${electionId}`),
  
  getElectionVotes: (electionId: string) => api.get(`/votes/election/${electionId}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: { name: string; email: string }) =>
    api.put('/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
  
  getVoters: () => api.get('/users/voters'),
  
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Tenants API
export const tenantsAPI = {
  getAll: () => api.get('/tenants'),
  
  getById: (id: string) => api.get(`/tenants/${id}`),
  
  create: (data: { tenantId: string; name: string }) =>
    api.post('/tenants', data),
  
  update: (id: string, data: { name: string }) =>
    api.put(`/tenants/${id}`, data),
  
  delete: (id: string) => api.delete(`/tenants/${id}`),
};

export default api;