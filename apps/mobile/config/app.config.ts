import Constants from 'expo-constants';

export const AppConfig = {
  name: 'Explore Adama',
  version: '1.0.0',
  buildNumber: '1',

  // API Configuration
  api: {
    baseURL:'http://192.168.8.129:3000',
    timeout: 15000,
  },
  // Whether to use mock data during development
  useMockData: (process.env.USE_MOCK_DATA === 'true') || (typeof __DEV__ !== 'undefined' && __DEV__),

  auth: {
    tokenRefreshInterval: 15 * 60 * 1000, // 15 min
    otpExpiry: 10 * 60 * 1000, // 10 min
    passwordMinLength: 6,
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  map: {
    defaultLatitude: 9.145,
    defaultLongitude: 40.4897,
    defaultZoom: 6,
    maxSearchRadius: 50, // km
  },

  booking: {
    maxGuests: 10,
    cancellationWindow: 24 * 60 * 60 * 1000,
  },

  payments: {
    currency: 'ETB',
    taxRate: 0.15,
    serviceFee: 2.5,
  },

  cache: {
    ttl: 5 * 60 * 1000,
    maxSize: 50,
  },

  features: {
    recommendations: {
      maxItems: 10,
      updateInterval: 30 * 60 * 1000,
    },
    social: {
      maxImageSize: 10 * 1024 * 1024,
      allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    },
  },
} as const;

export default AppConfig;
