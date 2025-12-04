import { UserRole } from '../../../shared/types/api.types';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: Profile;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name?: string;
  gender?: string;
  phone?: string;
  country?: string;
  avatar?: string;
  locale?: string;
  dateOfBirth?: string;
  bio?: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    searchable: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

/**export interface OTPVerificationData {
  email: string;
  code: string;
}
**/
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface SocialLoginData {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  userInfo?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export interface AuthState {
  user: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  } | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
}

export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  resetError: () => void;
}

// API Response Types
export interface ApiAuthResponse {
  success: boolean;
  data?: AuthResponse;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Social Login Types
export interface SocialUserInfo {
  id: string;
  name: string;
  email: string;
  photo?: string;
  provider: string;
}

// Token Types
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

// Session Types
export interface SessionInfo {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  createdAt: string;
}