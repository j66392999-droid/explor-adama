import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  // UI State
  theme: 'light' | 'dark' | 'auto';
  language: string;
  isDarkMode: boolean;
  isRTL: boolean;

  // App State
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAppReady: boolean;

  // Feature Flags
  featureFlags: Record<string, boolean>;

  // Network
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'none' | null;

  // Navigation
  currentRoute: string | null;
  previousRoute: string | null;

  // Offline
  offlineQueue: Array<{
    id: string;
    type: string;
    payload: any;
    timestamp: number;
  }>;

  // Performance
  performanceMetrics: {
    appStartTime: number;
    lastInteraction: number;
    memoryUsage: number;
  };

  // Notifications
  hasPendingNotifications: boolean;
  notificationPermission: 'granted' | 'denied' | 'default';
}

const initialState: AppState = {
  // UI State
  theme: 'auto',
  language: 'en',
  isDarkMode: false,
  isRTL: false,

  // App State
  isLoading: false,
  error: null,
  isInitialized: false,
  isAppReady: false,

  // Feature Flags
  featureFlags: {},

  // Network
  isConnected: true,
  connectionType: null,

  // Navigation
  currentRoute: null,
  previousRoute: null,

  // Offline
  offlineQueue: [],

  // Performance
  performanceMetrics: {
    appStartTime: Date.now(),
    lastInteraction: Date.now(),
    memoryUsage: 0,
  },

  // Notifications
  hasPendingNotifications: false,
  notificationPermission: 'default',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // UI Actions
    setTheme: (state, action: PayloadAction<AppState['theme']>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      state.isRTL = ['ar', 'he', 'fa'].includes(action.payload);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },

    // App State Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setAppReady: (state, action: PayloadAction<boolean>) => {
      state.isAppReady = action.payload;
    },

    // Feature Flags
    setFeatureFlags: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.featureFlags = { ...state.featureFlags, ...action.payload };
    },
    setFeatureFlag: (state, action: PayloadAction<{ flag: string; enabled: boolean }>) => {
      state.featureFlags[action.payload.flag] = action.payload.enabled;
    },

    // Network
    setConnectionStatus: (state, action: PayloadAction<{ isConnected: boolean; connectionType?: string }>) => {
      state.isConnected = action.payload.isConnected;
      if (action.payload.connectionType) {
        state.connectionType = action.payload.connectionType as any;
      }
    },

    // Navigation
    setCurrentRoute: (state, action: PayloadAction<string>) => {
      state.previousRoute = state.currentRoute;
      state.currentRoute = action.payload;
    },

    // Offline
    addToOfflineQueue: (state, action: PayloadAction<{ type: string; payload: any }>) => {
      state.offlineQueue.push({
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    removeFromOfflineQueue: (state, action: PayloadAction<string>) => {
      state.offlineQueue = state.offlineQueue.filter(item => item.id !== action.payload);
    },
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
    },

    // Performance
    updatePerformanceMetrics: (state, action: PayloadAction<Partial<AppState['performanceMetrics']>>) => {
      state.performanceMetrics = { ...state.performanceMetrics, ...action.payload };
    },
    recordInteraction: (state) => {
      state.performanceMetrics.lastInteraction = Date.now();
    },

    // Notifications
    setNotificationPermission: (state, action: PayloadAction<AppState['notificationPermission']>) => {
      state.notificationPermission = action.payload;
    },
    setHasPendingNotifications: (state, action: PayloadAction<boolean>) => {
      state.hasPendingNotifications = action.payload;
    },

    // Reset
    resetAppState: () => initialState,
  },
});

export const {
  setTheme,
  setLanguage,
  setDarkMode,
  setLoading,
  setError,
  clearError,
  setInitialized,
  setAppReady,
  setFeatureFlags,
  setFeatureFlag,
  setConnectionStatus,
  setCurrentRoute,
  addToOfflineQueue,
  removeFromOfflineQueue,
  clearOfflineQueue,
  updatePerformanceMetrics,
  recordInteraction,
  setNotificationPermission,
  setHasPendingNotifications,
  resetAppState,
} = appSlice.actions;

export default appSlice.reducer;