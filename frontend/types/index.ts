// User Types
export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfile = User & {
  subscription?: Subscription;
};

// Authentication Types
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

// Contract Types
export type ContractStatus = 'uploading' | 'processing' | 'complete' | 'failed';
export type ContractRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type Contract = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  status: ContractStatus;
  processingError: string | null;
  pageCount: number | null;
  wordCount: number | null;
  characterCount: number | null;
  riskScore: number | null;
  riskLevel: ContractRiskLevel | null;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
  hasAnalysis: boolean;
  tags: string[];
};

export type ContractListResponse = {
  contracts: Contract[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ContractUploadResponse = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: ContractStatus;
  message: string;
};

// Analysis Types
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskFlag = {
  clause: string;
  description: string;
  severity: RiskSeverity;
  category: string;
  location?: string;
  recommendation?: string;
};

export type ExtractedClause = {
  type: string;
  text: string;
  summary: string;
  startPage?: number;
  endPage?: number;
};

export type MissingClause = {
  type: string;
  description: string;
  importance: RiskSeverity;
  recommendation: string;
};

export type ContractSummary = {
  overview: string;
  keyPoints: string[];
  partiesInvolved: string[];
  effectiveDate?: string;
  terminationDate?: string;
};

export type RiskAnalysis = {
  overallScore: number;
  riskLevel: string;
  riskFlags: RiskFlag[];
  riskDistribution: Record<string, number>;
};

export type ContractAnalysis = {
  id: string;
  contractId: string;
  summary?: ContractSummary;
  riskAnalysis?: RiskAnalysis;
  extractedClauses?: ExtractedClause[];
  missingClauses?: MissingClause[];
  detailedAnalysis?: Record<string, any>;
  processingTimeSeconds?: number;
  modelUsed?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Subscription Types
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  contractLimit: number;
  features?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  contractsUsed: number;
  createdAt: Date;
  updatedAt: Date;
  plan?: Plan;
  remainingContracts?: number;
  isTrial?: boolean;
};

// Folder Types
export type Folder = {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  contractCount?: number;
  children?: Folder[];
};

// Tag Types
export type Tag = {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: Date;
  contractCount?: number;
};

// API Key Types
export type ApiKeyProvider = 'deepseek' | 'openai' | 'custom';

export type ApiKey = {
  id: string;
  userId: string;
  name: string;
  provider: ApiKeyProvider;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiKeyWithSecret = ApiKey & {
  key: string;
};

// Dashboard Types
export type DashboardStats = {
  totalContracts: number;
  processingContracts: number;
  completedContracts: number;
  failedContracts: number;
  riskDistribution: Record<string, number>;
  averageRiskScore: number;
  subscription: {
    planId: string;
    planName: string;
    contractsUsed: number;
    contractLimit: number;
    remainingContracts: number;
    usagePercentage: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    action: string;
    timestamp: Date;
    status: string;
  }>;
};

export type RiskOverview = {
  highRiskContracts: Array<{
    contractId: string;
    title: string;
    riskScore: number;
    riskLevel: string;
    riskFlags: Array<{
      clause: string;
      severity: string;
      category: string;
    }>;
    fileName: string;
    createdAt: Date;
  }>;
  mediumRiskContracts: any[];
  lowRiskContracts: any[];
  allContracts: any[];
};

// API Response Types
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

// Notification Types
export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
  createdAt: Date;
};

// File Types
export type FileInfo = {
  name: string;
  path: string;
  size: number;
  modifiedAt: Date;
};
