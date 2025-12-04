import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../utils/logging/logger';
import {
  STORAGE_KEYS,
  StorageKey,
  IStorageService,
  AuthStorage,
  UserData,
  AppSettings,
  UserPreferences,
  CachedData,
  SearchHistoryItem,
  OfflineQueueItem,
  StorageError,
  StorageConfig,
  DEFAULT_STORAGE_CONFIG,
} from './storage.types';

export class AsyncStorageService implements IStorageService {
  clearToken() {
    // Remove the stored auth token
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  private config: StorageConfig;
  private isInitialized = false;
  private readyPromise: Promise<void> | null = null;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.readyPromise = this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      // Test storage availability
      await AsyncStorage.setItem('@test', 'test');
      await AsyncStorage.removeItem('@test');
      
      this.isInitialized = true;
      try { logger.info('AsyncStorage initialized successfully'); } catch { try { console.log('AsyncStorage initialized successfully'); } catch {} }
      
      // Start auto cleanup
      this.startAutoCleanup();
      // Clear readyPromise (initialization complete)
      this.readyPromise = null;
    } catch (error: any) {
      try { logger.error('Failed to initialize AsyncStorage', error); } catch { try { console.error(`Failed to initialize AsyncStorage: ${error?.message || error}`); } catch {} }
      throw new StorageError(
        'Storage initialization failed',
        'STORAGE_UNAVAILABLE',
        error
      );
    }
  }

  // Basic operations
  async setItem<T>(key: StorageKey, value: T): Promise<void> {
    try {
      if (!this.isInitialized && this.readyPromise) await this.readyPromise;
      if (!this.isInitialized) {
        throw new StorageError('Storage not initialized', 'STORAGE_UNAVAILABLE');
      }

      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
      });

      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to set item for key: ${key}`,
        'SET_FAILED',
        error
      );
    }
  }

  async getItem<T>(key: StorageKey): Promise<T | null> {
    try {
      if (!this.isInitialized && this.readyPromise) await this.readyPromise;
      if (!this.isInitialized) {
        throw new StorageError('Storage not initialized', 'STORAGE_UNAVAILABLE');
      }

      const value = await AsyncStorage.getItem(key);
      
      if (!value) {
        return null;
      }

      const parsed = JSON.parse(value);
      return parsed.data as T;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      if (error instanceof SyntaxError) {
        throw new StorageError(
          `Failed to parse stored value for key: ${key}`,
          'JSON_PARSE_ERROR',
          error
        );
      }
      
      throw new StorageError(
        `Failed to get item for key: ${key}`,
        'GET_FAILED',
        error
      );
    }
  }

  async removeItem(key: StorageKey): Promise<void> {
    try {
      if (!this.isInitialized && this.readyPromise) await this.readyPromise;
      if (!this.isInitialized) {
        throw new StorageError('Storage not initialized', 'STORAGE_UNAVAILABLE');
      }

      await AsyncStorage.removeItem(key);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to remove item for key: ${key}`,
        'REMOVE_FAILED',
        error
      );
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.isInitialized && this.readyPromise) await this.readyPromise;
      if (!this.isInitialized) {
        throw new StorageError('Storage not initialized', 'STORAGE_UNAVAILABLE');
      }

      // Keep some essential items
      const keysToKeep: StorageKey[] = [
        STORAGE_KEYS.FIRST_LAUNCH,
        STORAGE_KEYS.APP_VERSION,
        STORAGE_KEYS.THEME_PREFERENCE,
        STORAGE_KEYS.LANGUAGE_PREFERENCE,
      ];

      const allKeys = (await AsyncStorage.getAllKeys()) as StorageKey[];
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError('Failed to clear storage', 'CLEAR_FAILED', error);
    }
  }

  // Auth specific methods
  async setToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setRefreshToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async clearRefreshToken(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async setUserData(user: UserData): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, user);
  }

  async getUserData(): Promise<UserData | null> {
    return this.getItem<UserData>(STORAGE_KEYS.USER_DATA);
  }

  async clearAuth(): Promise<void> {
    await this.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.SESSION_DATA,
    ]);
  }

  // App settings
  async setThemePreference(theme: AppSettings['theme']): Promise<void> {
    await this.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  }

  async getThemePreference(): Promise<AppSettings['theme']> {
    return (await this.getItem<AppSettings['theme']>(STORAGE_KEYS.THEME_PREFERENCE)) || 'auto';
  }

  async setLanguagePreference(language: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, language);
  }

  async getLanguagePreference(): Promise<string> {
    return (await this.getItem<string>(STORAGE_KEYS.LANGUAGE_PREFERENCE)) || 'en';
  }

  // Utility methods
  async multiSet<T>(items: Array<{ key: StorageKey; value: T }>): Promise<void> {
    try {
      const keyValuePairs = items.map(({ key, value }) => [
        key,
        JSON.stringify({
          data: value,
          timestamp: Date.now(),
        }),
      ]);

      await AsyncStorage.multiSet(keyValuePairs as any);
    } catch (error) {
      throw new StorageError('Failed to set multiple items', 'SET_FAILED', error);
    }
  }

  async multiGet(keys: StorageKey[]): Promise<Array<{ key: StorageKey; value: any }>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      
      return values.map(([key, value]) => {
        if (!value) {
          return { key: key as StorageKey, value: null };
        }

        try {
          const parsed = JSON.parse(value);
          return { key: key as StorageKey, value: parsed.data };
        } catch {
          return { key: key as StorageKey, value: null };
        }
      });
    } catch (error) {
      throw new StorageError('Failed to get multiple items', 'GET_FAILED', error);
    }
  }

  async multiRemove(keys: StorageKey[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      throw new StorageError('Failed to remove multiple items', 'REMOVE_FAILED', error);
    }
  }

  // Cache management
  async setCachedData<T>(key: StorageKey, data: T, ttl: number = this.config.defaultCacheTTL): Promise<void> {
    const cachedData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      version: '1.0',
    };

    await this.setItem(key, cachedData);
  }

  async getCachedData<T>(key: StorageKey): Promise<T | null> {
    const cached = await this.getItem<CachedData<T>>(key);
    
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() > cached.expiresAt) {
      await this.removeItem(key);
      return null;
    }

    return cached.data;
  }

  async isCacheValid(key: StorageKey, maxAge?: number): Promise<boolean> {
    const cached = await this.getItem<CachedData>(key);
    
    if (!cached) {
      return false;
    }

    const age = Date.now() - cached.timestamp;
    const isValid = maxAge ? age <= maxAge : Date.now() <= cached.expiresAt;

    if (!isValid) {
      await this.removeItem(key);
    }

    return isValid;
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith('cached_') || key === STORAGE_KEYS.SEARCH_HISTORY
      );

      for (const key of cacheKeys) {
        await this.isCacheValid(key as StorageKey);
      }
    } catch (error) {
      try { logger.warn('Failed to clear expired cache', error); } catch { try { console.warn('Failed to clear expired cache:', error); } catch {} }
    }
  }

  // Search history
  async addSearchHistory(item: Omit<SearchHistoryItem, 'timestamp'>): Promise<void> {
    const history = await this.getSearchHistory();
    
    // Remove duplicates
    const filteredHistory = history.filter(
      historyItem => historyItem.query !== item.query
    );

    // Add new item at the beginning
    const newHistory: SearchHistoryItem[] = [
      {
        ...item,
        timestamp: Date.now(),
      },
      ...filteredHistory,
    ];

    // Limit history size
    if (newHistory.length > this.config.maxSearchHistoryItems) {
      newHistory.splice(this.config.maxSearchHistoryItems);
    }

    await this.setItem(STORAGE_KEYS.SEARCH_HISTORY, newHistory);
  }

  async getSearchHistory(limit?: number): Promise<SearchHistoryItem[]> {
    const history = await this.getItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
    
    // Sort by timestamp (newest first) and apply limit
    const sortedHistory = history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit || this.config.maxSearchHistoryItems);

    return sortedHistory;
  }

  async clearSearchHistory(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }

  // Offline queue
  async addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queue = await this.getOfflineQueue();
    
    const newItem: OfflineQueueItem = {
      ...item,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const newQueue = [newItem, ...queue];

    // Limit queue size
    if (newQueue.length > this.config.maxOfflineQueueSize) {
      newQueue.splice(this.config.maxOfflineQueueSize);
    }

    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, newQueue);
  }

  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    return await this.getItem<OfflineQueueItem[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  }

  async removeFromOfflineQueue(id: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const filteredQueue = queue.filter(item => item.id !== id);
    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, filteredQueue);
  }

  async clearOfflineQueue(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  }

  // Auto cleanup
  private startAutoCleanup(): void {
    setInterval(() => {
      this.clearExpiredCache().catch(error => {
        try { logger.warn('Auto cleanup failed', error); } catch { try { console.warn('Auto cleanup failed:', error); } catch {} }
      });
    }, this.config.autoCleanupInterval);
  }

  // Storage info
  async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const multiGetResult = await AsyncStorage.multiGet(allKeys);
      
      let totalSize = 0;
      multiGetResult.forEach(([key, value]) => {
        if (value) {
          totalSize += key.length + value.length;
        }
      });

      return {
        totalKeys: allKeys.length,
        estimatedSize: totalSize,
      };
    } catch (error) {
      try { logger.warn('Failed to get storage info', error); } catch { try { console.warn('Failed to get storage info:', error); } catch {} }
      return { totalKeys: 0, estimatedSize: 0 };
    }
  }
}

// Create and export default instance
export const storage = new AsyncStorageService();

// Export for testing and custom configurations
export default AsyncStorageService;