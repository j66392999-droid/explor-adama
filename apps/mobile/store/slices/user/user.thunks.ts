import { createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../../shared/services/storage/asyncStorage';
import { logger } from '../../../shared/utils/logging/logger';
import { 
  setProfile, 
  setPreferences, 
  setStats, 
  setLoading, 
  setUpdating, 
  setError,
  updateProfile as updateProfileAction,
  updateLastActive,
} from './user.slice';
import { UserPreferences, UserStats } from './user.slice';

// Load user profile
export const loadUserProfile = createAsyncThunk(
  'user/loadProfile',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Simulate API call to load user profile
      // In a real app, this would be an actual API call
      const profile = {
        id: userId,
        email: 'user@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '+251912345678',
        country: 'Ethiopia',
        bio: 'Travel enthusiast exploring beautiful Ethiopia',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
      };

      dispatch(setProfile(profile));
      dispatch(setLoading(false));
      
      logger.info('User profile loaded', { userId });
      return profile;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load user profile';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      logger.error('Failed to load user profile', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: any, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setUpdating(true));
      dispatch(setError(null));

      // Simulate API call to update profile
      // In a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const state = getState() as any;
      const updatedProfile = {
        ...state.user.profile,
        ...profileData,
      };

      dispatch(updateProfileAction(profileData));
      
      // Update in storage
      await storage.setItem('user_profile', updatedProfile);
      
      dispatch(setUpdating(false));
      
      logger.info('User profile updated', { profileData });
      return updatedProfile;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      dispatch(setError(errorMessage));
      dispatch(setUpdating(false));
      logger.error('Failed to update user profile', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Load user preferences
export const loadUserPreferences = createAsyncThunk(
  'user/loadPreferences',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Try to load from storage first
      const storedPreferences = await storage.getItem<UserPreferences>('user_preferences');
      
      if (storedPreferences) {
        dispatch(setPreferences(storedPreferences));
        logger.debug('User preferences loaded from storage');
        return storedPreferences;
      }

      // Load default preferences
      const defaultPreferences: UserPreferences = {
        language: 'en',
        currency: 'ETB',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profileVisible: true,
          searchable: true,
          showLocation: false,
        },
        travel: {
          preferredCategories: [],
          budgetRange: {
            min: 0,
            max: 1000,
          },
          groupSize: 1,
          travelStyle: 'cultural',
        },
      };

      dispatch(setPreferences(defaultPreferences));
      await storage.setItem('user_preferences', defaultPreferences);
      
      logger.debug('Default user preferences loaded');
      return defaultPreferences;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load user preferences';
      logger.error('Failed to load user preferences', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update user preferences
export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setUpdating(true));

      const state = getState() as any;
      const updatedPreferences = {
        ...state.user.preferences,
        ...preferences,
      };

      dispatch(setPreferences(preferences));
      
      // Save to storage
      await storage.setItem('user_preferences', updatedPreferences);
      
      dispatch(setUpdating(false));
      
      logger.info('User preferences updated', { preferences });
      return updatedPreferences;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update preferences';
      dispatch(setError(errorMessage));
      dispatch(setUpdating(false));
      logger.error('Failed to update user preferences', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Load user stats
export const loadUserStats = createAsyncThunk(
  'user/loadStats',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      // Simulate API call to load user stats
      // In a real app, this would be an actual API call
      const stats: UserStats = {
        totalBookings: 15,
        totalReviews: 8,
        totalFavorites: 23,
        memberSince: '2023-01-15T00:00:00.000Z',
        lastActive: new Date().toISOString(),
      };

      dispatch(setStats(stats));
      
      logger.debug('User stats loaded', { userId, stats });
      return stats;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load user stats';
      logger.error('Failed to load user stats', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Upload avatar
export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageUri: string, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setUpdating(true));

      // Simulate avatar upload
      // In a real app, this would upload to your server
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const avatarUrl = `https://example.com/avatars/${Date.now()}.jpg`;
      
      dispatch(updateProfileAction({ avatar: avatarUrl }));
      dispatch(setUpdating(false));
      
      logger.info('Avatar uploaded successfully', { avatarUrl });
      return avatarUrl;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload avatar';
      dispatch(setError(errorMessage));
      dispatch(setUpdating(false));
      logger.error('Failed to upload avatar', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete account
export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (reason: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Simulate API call to delete account
      // In a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear user data from storage
      await storage.multiRemove([
        'user_profile',
        'user_preferences',
        'user_stats',
      ]);
      
      dispatch(setLoading(false));
      
      logger.info('User account deleted', { reason });
      return { success: true, reason };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete account';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      logger.error('Failed to delete user account', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Sync user data
export const syncUserData = createAsyncThunk(
  'user/syncData',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading(true));

      const state = getState() as any;
      const userId = state.auth.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Load all user data in parallel
      await Promise.all([
        dispatch(loadUserProfile(userId)).unwrap(),
        dispatch(loadUserPreferences()).unwrap(),
        dispatch(loadUserStats(userId)).unwrap(),
      ]);

      dispatch(updateLastActive());
      dispatch(setLoading(false));
      
      logger.info('User data synced successfully', { userId });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sync user data';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      logger.error('Failed to sync user data', error);
      return rejectWithValue(errorMessage);
    }
  }
);