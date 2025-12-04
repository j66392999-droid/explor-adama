import { createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../../shared/services/storage/asyncStorage';
import { logger } from '../../../shared/utils/logging/logger';
import { setTheme, setLanguage, setFeatureFlags, setInitialized, setAppReady } from './app.slice';

// Initialize app
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, { dispatch }) => {
    try {
      logger.info('Initializing app...');
      
      // Load persisted settings
      const [theme, language, featureFlags] = await Promise.all([
        storage.getThemePreference(),
        storage.getLanguagePreference(),
        storage.getItem('feature_flags') as Promise<Record<string, boolean> | null>,
      ]);

      // Apply settings
      if (theme) {
        dispatch(setTheme(theme));
      }

      if (language) {
        dispatch(setLanguage(language));
      }

      if (featureFlags) {
        dispatch(setFeatureFlags(featureFlags as Record<string, boolean>));
      }

      // Mark as initialized
      dispatch(setInitialized(true));

      logger.info('App initialized successfully');
      return { success: true };
    } catch (error) {
      logger.error('Failed to initialize app', error);
      throw error;
    }
  }
);

// Change theme
export const changeTheme = createAsyncThunk(
  'app/changeTheme',
  async (theme: 'light' | 'dark' | 'auto', { dispatch }) => {
    try {
      dispatch(setTheme(theme));
      await storage.setThemePreference(theme);
      logger.info(`Theme changed to: ${theme}`);
      return theme;
    } catch (error) {
      logger.error('Failed to change theme', error);
      throw error;
    }
  }
);

// Change language
export const changeLanguage = createAsyncThunk(
  'app/changeLanguage',
  async (language: string, { dispatch }) => {
    try {
      dispatch(setLanguage(language));
      await storage.setLanguagePreference(language);
      logger.info(`Language changed to: ${language}`);
      return language;
    } catch (error) {
      logger.error('Failed to change language', error);
      throw error;
    }
  }
);

// Load feature flags from server
export const loadFeatureFlags = createAsyncThunk(
  'app/loadFeatureFlags',
  async (_, { dispatch }) => {
    try {
      // Simulate API call to get feature flags
      // In a real app, this would be an actual API call
      const featureFlags = {
        chat: true,
        payments: true,
        social: true,
        darkMode: true,
        offlineMode: false,
        experimental: false,
      };

      dispatch(setFeatureFlags(featureFlags));
      await storage.setItem('feature_flags', featureFlags);
      
      logger.info('Feature flags loaded successfully');
      return featureFlags;
    } catch (error) {
      logger.error('Failed to load feature flags', error);
      throw error;
    }
  }
);

// Sync offline queue
export const syncOfflineQueue = createAsyncThunk(
  'app/syncOfflineQueue',
  async (_, { getState, dispatch }) => {
    try {
      const state = getState() as any;
      const offlineQueue = state.app.offlineQueue;

      if (offlineQueue.length === 0) {
        return { synced: 0, failed: 0 };
      }

      logger.info(`Syncing ${offlineQueue.length} offline actions`);

      let synced = 0;
      let failed = 0;

      // Process each item in the offline queue
      for (const item of offlineQueue) {
        try {
          // Simulate API call for each offline action
          // In a real app, you would make actual API calls here
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Remove from queue on success
          // dispatch(removeFromOfflineQueue(item.id));
          synced++;
        } catch (error) {
          logger.error(`Failed to sync offline action: ${item.type}`, error);
          failed++;
        }
      }

      logger.info(`Offline queue sync completed: ${synced} synced, ${failed} failed`);
      return { synced, failed };
    } catch (error) {
      logger.error('Failed to sync offline queue', error);
      throw error;
    }
  }
);

// Prepare app for use (after initialization)
export const prepareApp = createAsyncThunk(
  'app/prepare',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState() as any;
      
      if (!state.app.isInitialized) {
        throw new Error('App must be initialized first');
      }

      // Load feature flags
      await dispatch(loadFeatureFlags()).unwrap();

      // Sync any offline data
      if (state.app.isConnected) {
        await dispatch(syncOfflineQueue()).unwrap();
      }

      // Mark app as ready
      dispatch(setAppReady(true));

      logger.info('App preparation completed');
      return { success: true };
    } catch (error) {
      logger.error('Failed to prepare app', error);
      throw error;
    }
  }
);

// Check app health
export const checkAppHealth = createAsyncThunk(
  'app/checkHealth',
  async (_, { getState }) => {
    try {
      const state = getState() as any;
      
      const health = {
        timestamp: Date.now(),
        isInitialized: state.app.isInitialized,
        isAppReady: state.app.isAppReady,
        isConnected: state.app.isConnected,
        pendingRequests: state.api.pendingRequests,
        offlineQueueSize: state.app.offlineQueue.length,
        memoryUsage: state.app.performanceMetrics.memoryUsage,
      };

      logger.debug('App health check completed', health);
      return health;
    } catch (error) {
      logger.error('App health check failed', error);
      throw error;
    }
  }
);