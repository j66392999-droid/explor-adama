import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ApiState {
  // API call status tracking
  pendingRequests: number;
  lastRequestTime: number | null;
  lastError: {
    message: string;
    code: string;
    timestamp: number;
  } | null;

  // Rate limiting
  rateLimit: {
    remaining: number;
    limit: number;
    resetTime: number | null;
  };

  // Network status
  isOnline: boolean;
  lastOnlineCheck: number;

  // Cache information
  cache: {
    lastInvalidated: number;
    cacheHits: number;
    cacheMisses: number;
  };
}

const initialState: ApiState = {
  pendingRequests: 0,
  lastRequestTime: null,
  lastError: null,
  rateLimit: {
    remaining: 100,
    limit: 100,
    resetTime: null,
  },
  isOnline: true,
  lastOnlineCheck: Date.now(),
  cache: {
    lastInvalidated: Date.now(),
    cacheHits: 0,
    cacheMisses: 0,
  },
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    // Request tracking
    requestStarted: (state) => {
      state.pendingRequests += 1;
      state.lastRequestTime = Date.now();
    },
    requestCompleted: (state) => {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
    },
    requestFailed: (state, action: PayloadAction<{ message: string; code: string }>) => {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
      state.lastError = {
        ...action.payload,
        timestamp: Date.now(),
      };
    },
    clearError: (state) => {
      state.lastError = null;
    },

    // Rate limiting
    updateRateLimit: (state, action: PayloadAction<{ remaining: number; limit: number; resetTime: number }>) => {
      state.rateLimit = action.payload;
    },

    // Network status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.lastOnlineCheck = Date.now();
    },

    // Cache management
    incrementCacheHit: (state) => {
      state.cache.cacheHits += 1;
    },
    incrementCacheMiss: (state) => {
      state.cache.cacheMisses += 1;
    },
    invalidateCache: (state) => {
      state.cache.lastInvalidated = Date.now();
    },
    resetCacheStats: (state) => {
      state.cache.cacheHits = 0;
      state.cache.cacheMisses = 0;
    },

    // Reset state
    resetApiState: () => initialState,
  },
});

export const {
  requestStarted,
  requestCompleted,
  requestFailed,
  clearError,
  updateRateLimit,
  setOnlineStatus,
  incrementCacheHit,
  incrementCacheMiss,
  invalidateCache,
  resetCacheStats,
  resetApiState,
} = apiSlice.actions;

// Selectors
export const selectApiState = (state: { api: ApiState }) => state.api;
export const selectPendingRequests = (state: { api: ApiState }) => state.api.pendingRequests;
export const selectIsLoading = (state: { api: ApiState }) => state.api.pendingRequests > 0;
export const selectLastError = (state: { api: ApiState }) => state.api.lastError;
export const selectRateLimit = (state: { api: ApiState }) => state.api.rateLimit;
export const selectIsOnline = (state: { api: ApiState }) => state.api.isOnline;
export const selectCacheStats = (state: { api: ApiState }) => state.api.cache;
export const selectCacheHitRatio = (state: { api: ApiState }) => {
  const { cacheHits, cacheMisses } = state.api.cache;
  const total = cacheHits + cacheMisses;
  return total > 0 ? cacheHits / total : 0;
};

export default apiSlice.reducer;