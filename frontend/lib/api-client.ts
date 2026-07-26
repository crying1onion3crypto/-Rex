import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './constants';
import { TokenResponse } from '@/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) : null;
        
        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post<TokenResponse>(
            API_ENDPOINTS.REFRESH,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          // Store new tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_STORAGE_KEY, response.data.accessToken);
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.data.refreshToken);
          }
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<TokenResponse>(API_ENDPOINTS.LOGIN, credentials),
  
  refresh: (refreshToken: string) =>
    apiClient.post<TokenResponse>(API_ENDPOINTS.REFRESH, { refreshToken }),
  
  logout: () => apiClient.post(API_ENDPOINTS.LOGOUT),
  
  getMe: () => apiClient.get(API_ENDPOINTS.ME),
};

// User API
export const userApi = {
  getMe: () => apiClient.get(API_ENDPOINTS.USER_ME),
  
  updateMe: (data: any) => apiClient.put(API_ENDPOINTS.USER_ME, data),
  
  deleteMe: () => apiClient.delete(API_ENDPOINTS.USER_ME),
  
  // API Keys
  getApiKeys: () => apiClient.get(API_ENDPOINTS.USER_API_KEYS),
  
  createApiKey: (data: { name: string; provider: string }) =>
    apiClient.post(API_ENDPOINTS.USER_API_KEYS, data),
  
  updateApiKey: (apiKeyId: string, data: { name?: string; isActive?: boolean }) =>
    apiClient.put(`${API_ENDPOINTS.USER_API_KEYS}/${apiKeyId}`, data),
  
  deleteApiKey: (apiKeyId: string) =>
    apiClient.delete(`${API_ENDPOINTS.USER_API_KEYS}/${apiKeyId}`),
};

// Contract API
export const contractApi = {
  // Get all contracts
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    folderId?: string;
    status?: string;
    search?: string;
    tags?: string[];
  }) => apiClient.get(API_ENDPOINTS.CONTRACTS, { params }),
  
  // Get single contract
  getById: (contractId: string) =>
    apiClient.get(`${API_ENDPOINTS.CONTRACTS}/${contractId}`),
  
  // Create contract
  create: (data: any) => apiClient.post(API_ENDPOINTS.CONTRACTS, data),
  
  // Upload contract
  upload: (file: File, data?: { title?: string; description?: string; folderId?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data?.title) formData.append('title', data.title);
    if (data?.description) formData.append('description', data.description);
    if (data?.folderId) formData.append('folderId', data.folderId);
    
    return apiClient.post(API_ENDPOINTS.CONTRACT_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update contract
  update: (contractId: string, data: any) =>
    apiClient.put(`${API_ENDPOINTS.CONTRACTS}/${contractId}`, data),
  
  // Delete contract
  delete: (contractId: string) =>
    apiClient.delete(`${API_ENDPOINTS.CONTRACTS}/${contractId}`),
  
  // Trigger analysis
  analyze: (contractId: string) =>
    apiClient.post(`${API_ENDPOINTS.CONTRACTS}/${contractId}/analyze`),
};

// Analysis API
export const analysisApi = {
  getByContractId: (contractId: string) =>
    apiClient.get(API_ENDPOINTS.ANALYSIS(contractId)),
  
  create: (contractId: string, data?: { focusAreas?: string[]; customPrompt?: string }) =>
    apiClient.post(API_ENDPOINTS.ANALYSIS(contractId), data),
  
  getStatus: (contractId: string) =>
    apiClient.get(API_ENDPOINTS.ANALYSIS_STATUS(contractId)),
};

// Subscription API
export const subscriptionApi = {
  getPlans: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION_PLANS),
  
  getMe: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION_ME),
  
  upgrade: (planId: string) =>
    apiClient.post(API_ENDPOINTS.SUBSCRIPTION_UPGRADE(planId)),
  
  getUsage: () => apiClient.get(API_ENDPOINTS.SUBSCRIPTION_USAGE),
};

// Folder API
export const folderApi = {
  getAll: (parentId?: string) =>
    apiClient.get(API_ENDPOINTS.FOLDERS, { params: { parent_id: parentId } }),
  
  getById: (folderId: string) =>
    apiClient.get(`${API_ENDPOINTS.FOLDERS}/${folderId}`),
  
  create: (data: any) => apiClient.post(API_ENDPOINTS.FOLDERS, data),
  
  update: (folderId: string, data: any) =>
    apiClient.put(`${API_ENDPOINTS.FOLDERS}/${folderId}`, data),
  
  delete: (folderId: string) =>
    apiClient.delete(`${API_ENDPOINTS.FOLDERS}/${folderId}`),
};

// Tag API
export const tagApi = {
  getAll: (search?: string) =>
    apiClient.get(API_ENDPOINTS.TAGS, { params: { search } }),
  
  getById: (tagId: string) =>
    apiClient.get(`${API_ENDPOINTS.TAGS}/${tagId}`),
  
  create: (data: any) => apiClient.post(API_ENDPOINTS.TAGS, data),
  
  update: (tagId: string, data: any) =>
    apiClient.put(`${API_ENDPOINTS.TAGS}/${tagId}`, data),
  
  delete: (tagId: string) =>
    apiClient.delete(`${API_ENDPOINTS.TAGS}/${tagId}`),
};

// Settings API
export const settingsApi = {
  getApiKeys: () => apiClient.get(API_ENDPOINTS.SETTINGS_API_KEYS),
  
  createApiKey: (data: any) =>
    apiClient.post(API_ENDPOINTS.SETTINGS_API_KEYS, data),
  
  updateApiKey: (apiKeyId: string, data: any) =>
    apiClient.put(`${API_ENDPOINTS.SETTINGS_API_KEYS}/${apiKeyId}`, data),
  
  deleteApiKey: (apiKeyId: string) =>
    apiClient.delete(`${API_ENDPOINTS.SETTINGS_API_KEYS}/${apiKeyId}`),
  
  getProfile: () => apiClient.get(API_ENDPOINTS.SETTINGS_PROFILE),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get(API_ENDPOINTS.DASHBOARD_STATS),
  
  getRecentContracts: (limit?: number) =>
    apiClient.get(API_ENDPOINTS.DASHBOARD_RECENT_CONTRACTS, { params: { limit } }),
  
  getRiskOverview: () => apiClient.get(API_ENDPOINTS.DASHBOARD_RISK_OVERVIEW),
  
  getActivity: (limit?: number) =>
    apiClient.get(API_ENDPOINTS.DASHBOARD_ACTIVITY, { params: { limit } }),
};

// Export the main client for custom requests
export default apiClient;
