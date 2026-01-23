import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add token to requests if available
api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = useAuthStore.getState();
      const token = state.token;

      if (!token) {
        // No token to refresh, logout
        state.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        const { token: newToken, user } = response.data;

        // Update auth store with new token
        state.setAuth(user, newToken);

        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed, logout user
        state.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Admin API
export const adminAPI = {
  createDepartment: (data: any) => api.post('/admin/departments', data),
  getDepartments: () => api.get('/admin/departments'),
  createLevels: (data: any) => api.post('/admin/levels', data),
  getLevelsByDepartment: (departmentId: string) =>
    api.get(`/admin/levels/${departmentId}`),
  addLevel: (data: any) => api.post('/admin/levels/add', data),
  updateLevel: (levelId: string, data: any) =>
    api.put(`/admin/levels/${levelId}`, data),
  deleteLevel: (levelId: string) => api.delete(`/admin/levels/${levelId}`),
  createUser: (data: any) => api.post('/admin/users', data),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (userId: string, data: any) =>
    api.put(`/admin/users/${userId}`, data),
  deactivateUser: (userId: string) =>
    api.patch(`/admin/users/${userId}/deactivate`),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
};

// Department API
export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  getLevelsByDepartment: (departmentId: string) =>
    api.get(`/departments/${departmentId}/levels`),
};

// File API
export const fileAPI = {
  uploadFile: (formData: FormData) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getFiles: (params?: any) => api.get('/files', { params }),
  getFile: (fileId: string) => api.get(`/files/${fileId}`),
  downloadFile: (fileId: string, version?: number) => {
    const url = version
      ? `/files/${fileId}/download/${version}`
      : `/files/${fileId}/download`;
    return api.get(url, { responseType: 'blob' });
  },
  updateFile: (fileId: string, formData: FormData) =>
    api.put(`/files/${fileId}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Workflow API
export const workflowAPI = {
  passToNextLevel: (fileId: string, data: any) =>
    api.post(`/workflow/files/${fileId}/pass`, data),
  rejectFile: (fileId: string, data: any) =>
    api.post(`/workflow/files/${fileId}/reject`, data),
  getWorkflow: (fileId: string) => api.get(`/workflow/files/${fileId}`),
  getDepartmentUsers: (departmentId: string, excludeMe?: boolean) =>
    api.get(`/workflow/departments/${departmentId}/users`, {
      params: { excludeMe },
    }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
};
