import { storage } from './storage/asyncStorage';
import { apiClient } from './api/client';
import { AnalyticsService } from './analytics/analytics';
import { NotificationService } from './notification/pushNotifications';
import { logger } from '../utils/logging/logger';

/**
 * Main service initialization function
 * Call this in App.tsx to initialize all services
 */
export const initializeServices = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing services...');

    // Initialize services in sequence
    await storage.initialize?.();
    apiClient.setBaseURL?.(apiClient.getBaseURL());
    await AnalyticsService.initialize?.();
    await NotificationService.initialize?.();

    console.log('✅ All services initialized successfully');
  } catch (error: any) {
    try { logger.error('❌ Service initialization failed', error); } catch { try { console.error(`❌ Service initialization failed: ${error?.message || error}`); } catch {} }
    throw error;
  }
};

/**
 * Service cleanup function
 * Call this when app is closing or logging out
 */
export const cleanupServices = async (): Promise<void> => {
  try {
    console.log('🔄 Cleaning up services...');

    // Remove auth token from API client
    apiClient.clearAuthToken?.();

    // Clear storage (optional - be careful with this)
    // await StorageService.clear();

    console.log('✅ Services cleaned up successfully');
  } catch (error: any) {
    try { logger.error('❌ Service cleanup failed', error); } catch { try { console.error(`❌ Service cleanup failed: ${error?.message || error}`); } catch {} }
  }
};

// Export individual services for direct access
export { storage, apiClient as ApiClient, AnalyticsService, NotificationService };

// Export service types
export type { ApiResponse, PaginatedResponse, ApiError } from '../types/api.types.d';
export type { StorageKey } from './storage/storage.types';