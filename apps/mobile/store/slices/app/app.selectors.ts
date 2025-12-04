import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

// Basic selectors
export const selectAppState = (state: RootState) => state.app;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectLanguage = (state: RootState) => state.app.language;
export const selectIsDarkMode = (state: RootState) => state.app.isDarkMode;
export const selectIsRTL = (state: RootState) => state.app.isRTL;
export const selectIsLoading = (state: RootState) => state.app.isLoading;
export const selectError = (state: RootState) => state.app.error;
export const selectIsInitialized = (state: RootState) => state.app.isInitialized;
export const selectIsAppReady = (state: RootState) => state.app.isAppReady;
export const selectFeatureFlags = (state: RootState) => state.app.featureFlags;
export const selectIsConnected = (state: RootState) => state.app.isConnected;
export const selectConnectionType = (state: RootState) => state.app.connectionType;
export const selectCurrentRoute = (state: RootState) => state.app.currentRoute;
export const selectPreviousRoute = (state: RootState) => state.app.previousRoute;
export const selectOfflineQueue = (state: RootState) => state.app.offlineQueue;
export const selectPerformanceMetrics = (state: RootState) => state.app.performanceMetrics;
export const selectNotificationPermission = (state: RootState) => state.app.notificationPermission;
export const selectHasPendingNotifications = (state: RootState) => state.app.hasPendingNotifications;

// Memoized selectors
export const selectEffectiveTheme = createSelector(
  [selectTheme, selectIsDarkMode],
  (theme, isDarkMode) => {
    if (theme === 'auto') {
      return isDarkMode ? 'dark' : 'light';
    }
    return theme;
  }
);

export const selectFeatureFlag = (flag: string) => 
  createSelector(
    [selectFeatureFlags],
    (featureFlags) => featureFlags[flag] || false
  );

export const selectIsOnline = createSelector(
  [selectIsConnected, selectIsAppReady],
  (isConnected, isAppReady) => isConnected && isAppReady
);

export const selectOfflineQueueSize = createSelector(
  [selectOfflineQueue],
  (offlineQueue) => offlineQueue.length
);

export const selectAppUptime = createSelector(
  [selectPerformanceMetrics],
  (metrics) => Date.now() - metrics.appStartTime
);

export const selectTimeSinceLastInteraction = createSelector(
  [selectPerformanceMetrics],
  (metrics) => Date.now() - metrics.lastInteraction
);

export const selectAppStatus = createSelector(
  [selectIsLoading, selectError, selectIsAppReady, selectIsOnline],
  (isLoading, error, isAppReady, isOnline) => ({
    isLoading,
    error,
    isAppReady,
    isOnline,
    isError: !!error,
    isSuccess: !isLoading && !error && isAppReady,
  })
);

export const selectUIState = createSelector(
  [selectTheme, selectLanguage, selectIsDarkMode, selectIsRTL],
  (theme, language, isDarkMode, isRTL) => ({
    theme,
    language,
    isDarkMode,
    isRTL,
  })
);

export const selectNetworkState = createSelector(
  [selectIsConnected, selectConnectionType, selectIsOnline],
  (isConnected, connectionType, isOnline) => ({
    isConnected,
    connectionType,
    isOnline,
    isOffline: !isConnected,
  })
);

// Complex selectors
export const selectAvailableLanguages = createSelector(
  [selectAppState],
  () => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', isRTL: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
    // Add more languages as needed
  ]
);

export const selectEnabledFeatures = createSelector(
  [selectFeatureFlags],
  (featureFlags) => 
    Object.entries(featureFlags)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)
);

export const selectNavigationHistory = createSelector(
  [selectCurrentRoute, selectPreviousRoute],
  (currentRoute, previousRoute) => ({
    current: currentRoute,
    previous: previousRoute,
    canGoBack: !!previousRoute,
  })
);

export const selectAppPerformance = createSelector(
  [selectPerformanceMetrics, selectAppUptime, selectTimeSinceLastInteraction],
  (metrics, uptime, timeSinceLastInteraction) => ({
    ...metrics,
    uptime,
    timeSinceLastInteraction,
    isActive: timeSinceLastInteraction < 5 * 60 * 1000, // 5 minutes
  })
);