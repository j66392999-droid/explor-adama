export const AuthConstants = {
  // OTP Configuration
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  OTP_RESEND_DELAY: 60, // seconds

  // Password Requirements
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d).+$/,

  // Validation Regex
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]{10,}$/,

  // Token Configuration
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_REFRESH_ATTEMPTS: 3,

  // Session Configuration
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days

  // API Endpoints
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    PROFILE: '/auth/profile',
  },

  // Error Codes
  ERROR_CODES: {
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    INVALID_TOKEN: 'INVALID_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    RATE_LIMITED: 'RATE_LIMITED',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  },

  // Social Login Providers
  SOCIAL_PROVIDERS: {
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    APPLE: 'apple',
  },

  // User Roles
  ROLES: {
    TOURIST: 'TOURIST',
  },

  // Default User Preferences
  DEFAULT_PREFERENCES: {
    language: 'en',
    currency: 'ETB',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
} as const;

export type AuthConstantsType = typeof AuthConstants;