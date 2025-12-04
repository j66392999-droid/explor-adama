import { UserRole } from '../../../types/api.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    profile?: {
      name?: string;
      avatar?: string;
      phone?: string;
      country?: string;
    };
    banned: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
  userInfo?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  country?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthEndpoints {
  login: string;
  register: string;
  logout: string;
  refresh: string;
  forgotPassword: string;
  resetPassword: string;
  verifyEmail: string;
  resendVerification: string;
  socialLogin: string;
  changePassword: string;
  profile: string;
  me: string;
}