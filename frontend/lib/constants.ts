// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}${API_VERSION}/auth/login`,
  REFRESH: `${API_BASE_URL}${API_VERSION}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}${API_VERSION}/auth/logout`,
  ME: `${API_BASE_URL}${API_VERSION}/auth/me`,

  // Users
  USERS: `${API_BASE_URL}${API_VERSION}/users`,
  USER_ME: `${API_BASE_URL}${API_VERSION}/users/me`,
  USER_API_KEYS: `${API_BASE_URL}${API_VERSION}/users/api-keys`,

  // Contracts
  CONTRACTS: `${API_BASE_URL}${API_VERSION}/contracts`,
  CONTRACT_UPLOAD: `${API_BASE_URL}${API_VERSION}/contracts/upload`,
  CONTRACT_ANALYSIS: (contractId: string) => `${API_BASE_URL}${API_VERSION}/contracts/${contractId}/analyze`,

  // Analysis
  ANALYSIS: (contractId: string) => `${API_BASE_URL}${API_VERSION}/analysis/${contractId}`,
  ANALYSIS_STATUS: (contractId: string) => `${API_BASE_URL}${API_VERSION}/analysis/${contractId}/status`,

  // Subscription
  SUBSCRIPTION_PLANS: `${API_BASE_URL}${API_VERSION}/subscription/plans`,
  SUBSCRIPTION_ME: `${API_BASE_URL}${API_VERSION}/subscription/me`,
  SUBSCRIPTION_UPGRADE: (planId: string) => `${API_BASE_URL}${API_VERSION}/subscription/upgrade/${planId}`,
  SUBSCRIPTION_USAGE: `${API_BASE_URL}${API_VERSION}/subscription/usage`,

  // Folders
  FOLDERS: `${API_BASE_URL}${API_VERSION}/folders`,

  // Tags
  TAGS: `${API_BASE_URL}${API_VERSION}/tags`,

  // Settings
  SETTINGS_API_KEYS: `${API_BASE_URL}${API_VERSION}/settings/api-keys`,
  SETTINGS_PROFILE: `${API_BASE_URL}${API_VERSION}/settings/profile`,

  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}${API_VERSION}/dashboard/stats`,
  DASHBOARD_RECENT_CONTRACTS: `${API_BASE_URL}${API_VERSION}/dashboard/recent-contracts`,
  DASHBOARD_RISK_OVERVIEW: `${API_BASE_URL}${API_VERSION}/dashboard/risk-overview`,
  DASHBOARD_ACTIVITY: `${API_BASE_URL}${API_VERSION}/dashboard/activity`,
};

// Application Constants
export const APP_NAME = 'Contract AI SaaS';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-Powered Contract Review SaaS for SMBs';

// File Upload Constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt', '.doc'];

// Authentication Constants
export const TOKEN_STORAGE_KEY = 'contract-ai-token';
export const REFRESH_TOKEN_STORAGE_KEY = 'contract-ai-refresh-token';
export const SESSION_STORAGE_KEY = 'contract-ai-session';

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Risk Level Constants
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// Contract Status Constants
export const CONTRACT_STATUSES = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  uploading: 'Uploading',
  processing: 'Processing',
  complete: 'Complete',
  failed: 'Failed',
};

// Subscription Constants
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    contractLimit: 5,
    features: ['Basic contract analysis', 'Limited storage', 'Email support'],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 249,
    contractLimit: 50,
    features: [
      'Advanced contract analysis',
      'Priority processing',
      'Full feature access',
      'Priority support',
      'Team collaboration',
    ],
  },
};

// AI Constants
export const AI_PROVIDERS = {
  DEEPSEEK: 'deepseek',
  OPENAI: 'openai',
};

// Storage Constants
export const STORAGE_KEYS = {
  THEME: 'contract-ai-theme',
  USER_PREFERENCES: 'contract-ai-user-preferences',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  SUBSCRIPTION_LIMIT: 'You have reached your contract limit. Please upgrade your plan.',
  FILE_UPLOAD_ERROR: 'Failed to upload file. Please check the file and try again.',
  FILE_SIZE_ERROR: (maxSize: number) => `File size exceeds the maximum limit of ${maxSize / 1024 / 1024}MB.`,
  FILE_TYPE_ERROR: (allowedTypes: string[]) => `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  REGISTER_SUCCESS: 'Registration successful! Please check your email to verify your account.',
  CONTRACT_UPLOAD_SUCCESS: 'Contract uploaded successfully!',
  CONTRACT_DELETE_SUCCESS: 'Contract deleted successfully!',
  ANALYSIS_STARTED: 'Analysis started. You will be notified when it completes.',
  ANALYSIS_COMPLETE: 'Analysis completed successfully!',
  SUBSCRIPTION_UPGRADE_SUCCESS: 'Subscription upgraded successfully!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  API_KEY_CREATED: 'API key created successfully!',
  API_KEY_DELETED: 'API key deleted successfully!',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM D, YYYY',
  LONG: 'MMMM D, YYYY',
  TIME: 'h:mm A',
  DATETIME: 'MMM D, YYYY h:mm A',
};
