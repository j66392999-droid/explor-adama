import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../store';

// Basic selectors
const selectAuthState = (state: RootState) => state.auth;

export const selectUser = createSelector(
  selectAuthState,
  (auth) => auth.user
);

export const selectTokens = createSelector(
  selectAuthState,
  (auth) => auth.tokens
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (auth) => auth.isLoading
);

export const selectError = createSelector(
  selectAuthState,
  (auth) => auth.error
);

export const selectAccessToken = createSelector(
  selectTokens,
  (tokens) => tokens?.accessToken || null
);

export const selectRefreshToken = createSelector(
  selectTokens,
  (tokens) => tokens?.refreshToken || null
);

// User profile selectors
export const selectUserProfile = createSelector(
  selectUser,
  (user) => user?.profile
);

export const selectUserName = createSelector(
  selectUserProfile,
  (profile) => profile?.name || 'Traveler'
);

export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email
);

export const selectUserAvatar = createSelector(
  selectUserProfile,
  (profile) => profile?.avatar
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role
);

export const selectIsTourist = createSelector(
  selectUserRole,
  (role) => role === 'TOURIST'
);

// Complex selectors
export const selectAuthStatus = createSelector(
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    error,
    isReady: !isLoading && !error,
  })
);

export const selectUserPreferences = createSelector(
  selectUser,
  (user) => user?.profile || null
);

// Memoized selectors for performance
export const makeSelectHasPermission = (permission: string) =>
  createSelector(
    selectUserRole,
    (role) => {
      // Implement permission logic based on user role
      switch (role) {
        case 'TOURIST':
          return ['read', 'review'].includes(permission);
        default:
          return false;
      }
    }
  );

export const selectCanBookEvents = createSelector(
  selectUserRole,
  (role) => role === 'TOURIST' 
);

export const selectCanCreateContent = createSelector(
  selectUserRole,
  (role) => role === 'TOURIST' 
);