import Keychain from 'react-native-keychain';
import Constants from 'expo-constants';
import {
  STORAGE_KEYS,
  StorageKey,
  IStorageService,
  UserData,
  StorageError,
} from './storage.types';

// Keys that should be stored securely
const SECURE_KEYS: StorageKey[] = [
  STORAGE_KEYS.AUTH_TOKEN,
  STORAGE_KEYS.REFRESH_TOKEN,
  STORAGE_KEYS.USER_DATA,
];

// Keychain configuration
const KEYCHAIN_CONFIG = {
  service: 'com.travelethiopia.app',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export class SecureStorageService implements IStorageService {
  private asyncStorage: IStorageService;
  private hasKeychain = Boolean(
    Keychain &&
    typeof (Keychain as any).getGenericPassword === 'function' &&
    // Avoid calling keychain in Expo Go (native modules aren't linked there)
    (Constants?.appOwnership !== 'expo')
  );

  constructor(asyncStorage: IStorageService) {
    this.asyncStorage = asyncStorage;
  }

  // Check if a key should be stored securely
  private isSecureKey(key: StorageKey): boolean {
    return SECURE_KEYS.includes(key);
  }

  // Basic operations
  async setItem<T>(key: StorageKey, value: T): Promise<void> {
    try {
      if (this.isSecureKey(key)) {
        await this.setSecureItem(key, JSON.stringify(value));
      } else {
        await this.asyncStorage.setItem(key, value);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to set secure item for key: ${key}`,
        'SET_FAILED',
        error
      );
    }
  }

  async getItem<T>(key: StorageKey): Promise<T | null> {
    try {
      if (this.isSecureKey(key)) {
        const value = await this.getSecureItem(key);
        return value ? JSON.parse(value) : null;
      } else {
        return await this.asyncStorage.getItem<T>(key);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      
      if (error instanceof SyntaxError) {
        throw new StorageError(
          `Failed to parse secure value for key: ${key}`,
          'JSON_PARSE_ERROR',
          error
        );
      }
      
      throw new StorageError(
        `Failed to get secure item for key: ${key}`,
        'GET_FAILED',
        error
      );
    }
  }

  async removeItem(key: StorageKey): Promise<void> {
    try {
      if (this.isSecureKey(key)) {
        await this.removeSecureItem(key);
      } else {
        await this.asyncStorage.removeItem(key);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to remove secure item for key: ${key}`,
        'REMOVE_FAILED',
        error
      );
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear secure storage
      for (const key of SECURE_KEYS) {
        await this.removeSecureItem(key);
      }
      
      // Clear regular storage
      await this.asyncStorage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear secure storage', 'CLEAR_FAILED', error);
    }
  }

  // Secure storage methods
  private async setSecureItem(key: StorageKey, value: string): Promise<void> {
    try {
      if (this.hasKeychain) {
        await Keychain.setGenericPassword(key, value, KEYCHAIN_CONFIG);
        return;
      }

      // If Keychain is not available, fall back to async storage
      await this.asyncStorage.setItem(key, JSON.parse(value));
    } catch (error) {
      console.warn(`Failed to set secure item ${key}, falling back to async storage:`, error);
      // Fallback to async storage if keychain fails
      await this.asyncStorage.setItem(key, JSON.parse(value));
    }
  }

  private async getSecureItem(key: StorageKey): Promise<string | null> {
    try {
      if (!this.hasKeychain) {
        // Fallback to async storage
        const value = await this.asyncStorage.getItem(key);
        return value ? JSON.stringify(value) : null;
      }

      const credentials = await Keychain.getGenericPassword(KEYCHAIN_CONFIG as any);
      
      if (credentials && credentials.username === key) {
        return credentials.password;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to get secure item ${key}, trying async storage:`, error);
      // Fallback to async storage
      const value = await this.asyncStorage.getItem(key);
      return value ? JSON.stringify(value) : null;
    }
  }

  private async removeSecureItem(key: StorageKey): Promise<void> {
    try {
      if (this.hasKeychain) {
        await Keychain.resetGenericPassword(KEYCHAIN_CONFIG as any);
        return;
      }

      // No keychain available; fall back to async storage
      await this.asyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove secure item ${key}, trying async storage:`, error);
      // Fallback to async storage
      await this.asyncStorage.removeItem(key);
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

  // App settings (delegate to async storage)
  async setThemePreference(theme: any): Promise<void> {
    await this.asyncStorage.setThemePreference(theme);
  }

  async getThemePreference(): Promise<any> {
    return this.asyncStorage.getThemePreference();
  }

  async setLanguagePreference(language: string): Promise<void> {
    await this.asyncStorage.setLanguagePreference(language);
  }

  async getLanguagePreference(): Promise<string> {
    return this.asyncStorage.getLanguagePreference();
  }

  // Utility methods (delegate to async storage)
  async multiSet<T>(items: Array<{ key: StorageKey; value: T }>): Promise<void> {
    // Separate secure and regular items
    const secureItems: Array<{ key: StorageKey; value: T }> = [];
    const regularItems: Array<{ key: StorageKey; value: T }> = [];

    items.forEach(item => {
      if (this.isSecureKey(item.key)) {
        secureItems.push(item);
      } else {
        regularItems.push(item);
      }
    });

    // Set secure items individually
    for (const item of secureItems) {
      await this.setItem(item.key, item.value);
    }

    // Set regular items in batch
    if (regularItems.length > 0) {
      await this.asyncStorage.multiSet(regularItems);
    }
  }

  async multiGet(keys: StorageKey[]): Promise<Array<{ key: StorageKey; value: any }>> {
    const results: Array<{ key: StorageKey; value: any }> = [];

    for (const key of keys) {
      const value = await this.getItem(key);
      results.push({ key, value });
    }

    return results;
  }

  async multiRemove(keys: StorageKey[]): Promise<void> {
    for (const key of keys) {
      await this.removeItem(key);
    }
  }

  // Cache management (delegate to async storage)
  async setCachedData<T>(key: StorageKey, data: T, ttl?: number): Promise<void> {
    await this.asyncStorage.setCachedData(key, data, ttl);
  }

  async getCachedData<T>(key: StorageKey): Promise<T | null> {
    return this.asyncStorage.getCachedData<T>(key);
  }

  async isCacheValid(key: StorageKey, maxAge?: number): Promise<boolean> {
    return this.asyncStorage.isCacheValid(key, maxAge);
  }

  async clearExpiredCache(): Promise<void> {
    await this.asyncStorage.clearExpiredCache();
  }

  // Search history (delegate to async storage)
  async addSearchHistory(item: any): Promise<void> {
    await this.asyncStorage.addSearchHistory(item);
  }

  async getSearchHistory(limit?: number): Promise<any[]> {
    return this.asyncStorage.getSearchHistory(limit);
  }

  async clearSearchHistory(): Promise<void> {
    await this.asyncStorage.clearSearchHistory();
  }

  // Offline queue (delegate to async storage)
  async addToOfflineQueue(item: any): Promise<void> {
    await this.asyncStorage.addToOfflineQueue(item);
  }

  async getOfflineQueue(): Promise<any[]> {
    return this.asyncStorage.getOfflineQueue();
  }

  async removeFromOfflineQueue(id: string): Promise<void> {
    await this.asyncStorage.removeFromOfflineQueue(id);
  }

  async clearOfflineQueue(): Promise<void> {
    await this.asyncStorage.clearOfflineQueue();
  }

  // Biometric methods
  async setItemWithBiometric<T>(key: StorageKey, value: T): Promise<void> {
    try {
      if (!this.hasKeychain) {
        throw new StorageError(`Biometric storage is not available`, 'STORAGE_UNAVAILABLE');
      }
      const biometricConfig = {
        ...KEYCHAIN_CONFIG,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      };

      await Keychain.setGenericPassword(key, JSON.stringify(value), biometricConfig);
    } catch (error) {
      throw new StorageError(
        `Failed to set biometric item for key: ${key}`,
        'SET_FAILED',
        error
      );
    }
  }

  async getItemWithBiometric<T>(key: StorageKey): Promise<T | null> {
    try {
      if (!this.hasKeychain) {
        throw new StorageError(`Biometric storage is not available`, 'STORAGE_UNAVAILABLE');
      }
      const biometricConfig = {
        ...KEYCHAIN_CONFIG,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      };

      const credentials = await Keychain.getGenericPassword(biometricConfig);
      
      if (credentials && credentials.username === key) {
        return JSON.parse(credentials.password);
      }
      
      return null;
    } catch (error) {
      throw new StorageError(
        `Failed to get biometric item for key: ${key}`,
        'GET_FAILED',
        error
      );
    }
  }

  // Check if biometric storage is available
  async isBiometricStorageAvailable(): Promise<boolean> {
    try {
      if (!this.hasKeychain) return false;
      const result = await Keychain.getSupportedBiometryType?.();
      return result !== null && result !== undefined;
    } catch (error) {
      return false;
    }
  }
}

// Create and export default instance
import { storage as asyncStorage } from './asyncStorage';
export const secureStorage = new SecureStorageService(asyncStorage);

export default SecureStorageService;