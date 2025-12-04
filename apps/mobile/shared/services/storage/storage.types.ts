// Storage keys for the application
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SESSION_DATA: 'session_data',
  
  // App settings
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  APP_SETTINGS: 'app_settings',
  
  // User preferences
  USER_PREFERENCES: 'user_preferences',
  NOTIFICATION_SETTINGS: 'notification_settings',
  
  // Cached data
  CACHED_PLACES: 'cached_places',
  CACHED_EVENTS: 'cached_events',
  CACHED_CATEGORIES: 'cached_categories',
  SEARCH_HISTORY: 'search_history',
  
  // Feature flags
  FEATURE_FLAGS: 'feature_flags',
  
  // Offline data
  OFFLINE_QUEUE: 'offline_queue',
  PENDING_SYNC: 'pending_sync',

  // User specific cached keys
  USER_PROFILE: 'user_profile',
  USER_STATS: 'user_stats',
  
  // Misc
  FIRST_LAUNCH: 'first_launch',
  LAST_SYNC_DATE: 'last_sync_date',
  APP_VERSION: 'app_version',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Storage value types
export interface AuthStorage {
  token: string;
  refreshToken: string;
  user: UserData;
  expiresAt: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: {
    avatar?: string;
    phone?: string;
    country?: string;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserPreferences {
  favoriteCategories: string[];
  preferredLocations: string[];
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
  travelStyle: 'budget' | 'luxury' | 'adventure' | 'cultural';
}

export interface CachedData<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type: 'place' | 'event' | 'restaurant' | 'general';
  resultsCount?: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

// Storage service interface
export interface IStorageService {
  // Basic operations
  setItem<T>(key: StorageKey, value: T): Promise<void>;
  getItem<T>(key: StorageKey): Promise<T | null>;
  removeItem(key: StorageKey): Promise<void>;
  clear(): Promise<void>;
  
  // Auth specific
  setToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setUserData(user: UserData): Promise<void>;
  getUserData(): Promise<UserData | null>;
  clearAuth(): Promise<void>;
  
  // App settings
  setThemePreference(theme: AppSettings['theme']): Promise<void>;
  getThemePreference(): Promise<AppSettings['theme']>;
  setLanguagePreference(language: string): Promise<void>;
  getLanguagePreference(): Promise<string>;
  
  // Utility methods
  multiSet<T>(items: Array<{ key: StorageKey; value: T }>): Promise<void>;
  multiGet(keys: StorageKey[]): Promise<Array<{ key: StorageKey; value: any }>>;
  multiRemove(keys: StorageKey[]): Promise<void>;
  
  // Cache management
  setCachedData<T>(key: StorageKey, data: T, ttl?: number): Promise<void>;
  getCachedData<T>(key: StorageKey): Promise<T | null>;
  isCacheValid(key: StorageKey, maxAge?: number): Promise<boolean>;
  clearExpiredCache(): Promise<void>;
  
  // Search history
  addSearchHistory(item: Omit<SearchHistoryItem, 'timestamp'>): Promise<void>;
  getSearchHistory(limit?: number): Promise<SearchHistoryItem[]>;
  clearSearchHistory(): Promise<void>;
  
  // Offline queue
  addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void>;
  getOfflineQueue(): Promise<OfflineQueueItem[]>;
  removeFromOfflineQueue(id: string): Promise<void>;
  clearOfflineQueue(): Promise<void>;
}

// Storage error types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: StorageErrorCode,
    public originalError?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export type StorageErrorCode =
  | 'SET_FAILED'
  | 'GET_FAILED'
  | 'REMOVE_FAILED'
  | 'CLEAR_FAILED'
  | 'JSON_PARSE_ERROR'
  | 'JSON_STRINGIFY_ERROR'
  | 'STORAGE_FULL'
  | 'STORAGE_UNAVAILABLE';

// Storage configuration
export interface StorageConfig {
  // Cache settings
  defaultCacheTTL: number; // in milliseconds
  maxCacheSize: number; // in bytes
  
  // Search history
  maxSearchHistoryItems: number;
  
  // Offline queue
  maxOfflineQueueSize: number;
  maxRetryCount: number;
  
  // Cleanup
  autoCleanupInterval: number; // in milliseconds
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  defaultCacheTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxCacheSize: 10 * 1024 * 1024, // 10MB
  maxSearchHistoryItems: 50,
  maxOfflineQueueSize: 100,
  maxRetryCount: 3,
  autoCleanupInterval: 60 * 60 * 1000, // 1 hour
};