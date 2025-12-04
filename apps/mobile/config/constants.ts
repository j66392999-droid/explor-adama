import { Dimensions, Platform } from 'react-native';
import { AppConfig } from './app.config';

export const Constants = {

  API: {
    BASE_URL: AppConfig.api.baseURL,
    TIMEOUT: AppConfig.api.timeout,
  },
  
  // Device
  device: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isTablet: Dimensions.get('window').width >= 768,
  },

  // Layout
  layout: {
    headerHeight: 56,
    tabBarHeight: 60,
    bottomSheetHandleHeight: 24,
    screenPadding: 20,
    cardBorderRadius: 12,
    buttonBorderRadius: 8,
  },

  // Animation
  animation: {
    defaultDuration: 300,
    fastDuration: 150,
    slowDuration: 500,
  },

  // Storage Keys
  storage: {
    authToken: 'auth_token',
    refreshToken: 'refresh_token',
    userData: 'user_data',
    appSettings: 'app_settings',
    favorites: 'favorites_data',
  },

  // Social Login Providers
  socialProviders: {
    google: 'google',
    facebook: 'facebook',
    apple: 'apple',
  },

  // Error Messages
  errors: {
    network: 'Network error. Please check your connection.',
    server: 'Server error. Please try again later.',
    unauthorized: 'Session expired. Please login again.',
    unknown: 'An unexpected error occurred.',
    location: 'Location access is required for this feature.',
    camera: 'Camera access is required for this feature.',
  },

  // Success Messages
  success: {
    profileUpdated: 'Profile updated successfully',
    bookingCreated: 'Booking confirmed successfully',
    reviewSubmitted: 'Review submitted successfully',
    favoriteAdded: 'Added to favorites',
    favoriteRemoved: 'Removed from favorites',
  },

  // Validation Messages
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    passwordLength: 'Password must be at least 6 characters',
    passwordMatch: 'Passwords do not match',
  },

  // Date & Time Formats
  formats: {
    date: 'MMM DD, YYYY',
    time: 'HH:mm',
    datetime: 'MMM DD, YYYY HH:mm',
    apiDate: 'YYYY-MM-DD',
    apiDateTime: 'YYYY-MM-DDTHH:mm:ssZ',
  },
} as const;