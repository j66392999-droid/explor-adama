import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/state/useAppSelector';
import { profileApi } from '../services/profile.api';
import {
  ExtendedProfile,
  EditProfileData,
  PrivacySettings,
  NotificationSettings,
  AccountSettings,
  ProfileStats,
  ProfileAchievement,
  Session,
} from '../types/profile.types';
import { logger } from '../../../shared/utils/logging/logger';
import { setLoading, setError } from '../../../store/slices/app/app.slice';
import * as ImagePicker from 'expo-image-picker';

export const useProfile = (userId?: string) => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector(state => state.auth);
  const { isConnected, isLoading: appIsLoading } = useAppSelector(state => state.app);

  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [achievements, setAchievements] = useState<ProfileAchievement[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [accountSettings, setAccountSettings] = useState<AccountSettings | null>(null);

  const isOwnProfile = !userId || userId === currentUser?.id;

  // Load profile data
  const loadProfile = useCallback(async (): Promise<ExtendedProfile | null> => {
    if (!isConnected) {
      dispatch(setError('No internet connection'));
      return null;
    }

    try {
      dispatch(setLoading(true));
      const profileData = await profileApi.getProfile(userId);
      setProfile(profileData);
      return profileData;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load profile';
      dispatch(setError(errorMessage));
      logger.error('Failed to load profile', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [userId, isConnected, dispatch]);

  // Load profile stats
  const loadProfileStats = useCallback(async (): Promise<ProfileStats | null> => {
    if (!isConnected) return null;

    try {
      const statsData = await profileApi.getProfileStats(userId);
      setStats(statsData);
      return statsData;
    } catch (error: any) {
      logger.error('Failed to load profile stats', error);
      return null;
    }
  }, [userId, isConnected]);

  // Load achievements
  const loadAchievements = useCallback(async (): Promise<ProfileAchievement[]> => {
    if (!isConnected || !isOwnProfile) return [];

    try {
      const achievementsData = await profileApi.getAchievements();
      setAchievements(achievementsData);
      return achievementsData;
    } catch (error: any) {
      logger.error('Failed to load achievements', error);
      return [];
    }
  }, [isOwnProfile, isConnected]);

  // Load settings
  const loadSettings = useCallback(async (): Promise<void> => {
    if (!isConnected || !isOwnProfile) return;

    try {
      const [privacy, notifications, account] = await Promise.all([
        profileApi.getPrivacySettings(),
        profileApi.getNotificationSettings(),
        profileApi.getAccountSettings(),
      ]);

      setPrivacySettings(privacy);
      setNotificationSettings(notifications);
      setAccountSettings(account);
    } catch (error: any) {
      logger.error('Failed to load settings', error);
    }
  }, [isOwnProfile, isConnected]);

  // Load sessions
  const loadSessions = useCallback(async (): Promise<Session[]> => {
    if (!isConnected || !isOwnProfile) return [];

    try {
      const sessionsData = await profileApi.getActiveSessions();
      setSessions(sessionsData);
      return sessionsData;
    } catch (error: any) {
      logger.error('Failed to load sessions', error);
      return [];
    }
  }, [isOwnProfile, isConnected]);

  // Initialize
  const initializeProfile = useCallback(async (): Promise<void> => {
    if (!isConnected) return;

    try {
      await Promise.all([
        loadProfile(),
        loadProfileStats(),
      ]);

      if (isOwnProfile) {
        await Promise.all([
          loadAchievements(),
          loadSettings(),
          loadSessions(),
        ]);
      }
    } catch (error: any) {
      logger.error('Failed to initialize profile', error);
    }
  }, [
    isConnected,
    isOwnProfile,
    loadProfile,
    loadProfileStats,
    loadAchievements,
    loadSettings,
    loadSessions,
  ]);

  // Update profile
  const updateProfile = useCallback(async (data: EditProfileData): Promise<ExtendedProfile | null> => {
    if (!isConnected) return null;

    try {
      dispatch(setLoading(true));
      const updatedProfile = await profileApi.updateProfile(data);
      setProfile(updatedProfile);
      logger.info('Profile updated successfully');
      return updatedProfile;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      dispatch(setError(errorMessage));
      logger.error('Failed to update profile', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [isConnected, dispatch]);

  // Upload avatar
  const uploadAvatar = useCallback(async (imageUri: string): Promise<string | null> => {
    if (!isConnected) return null;

    try {
      const result = await profileApi.uploadAvatar(imageUri);
      
      // Update local profile
      if (profile) {
        setProfile({
          ...profile,
          avatar: result.url,
        });
      }

      logger.info('Avatar uploaded successfully');
      return result.url;
    } catch (error: any) {
      logger.error('Failed to upload avatar', error);
      return null;
    }
  }, [isConnected, profile]);

  // Upload cover image
  const uploadCoverImage = useCallback(async (imageUri: string): Promise<string | null> => {
    if (!isConnected) return null;

    try {
      const result = await profileApi.uploadCoverImage(imageUri);

      // Update local profile
      if (profile) {
        setProfile({
          ...profile,
          coverImage: result.url,
        });
      }

      logger.info('Cover image uploaded successfully');
      return result.url;
    } catch (error: any) {
      logger.error('Failed to upload cover image', error);
      return null;
    }
  }, [isConnected, profile]);

  // Pick image from gallery
  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error: any) {
      logger.error('Failed to pick image', error);
      return null;
    }
  }, []);

  // Take photo
  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error: any) {
      logger.error('Failed to take photo', error);
      return null;
    }
  }, []);

  // Update privacy settings
  const updatePrivacy = useCallback(async (
    settings: Partial<PrivacySettings>
  ): Promise<PrivacySettings | null> => {
    if (!isConnected || !privacySettings) return null;

    try {
      const updatedSettings = await profileApi.updatePrivacySettings({
        ...privacySettings,
        ...settings,
      });
      setPrivacySettings(updatedSettings);
      logger.info('Privacy settings updated');
      return updatedSettings;
    } catch (error: any) {
      logger.error('Failed to update privacy settings', error);
      return null;
    }
  }, [isConnected, privacySettings]);

  // Update notification settings
  const updateNotifications = useCallback(async (
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null> => {
    if (!isConnected || !notificationSettings) return null;

    try {
      const updatedSettings = await profileApi.updateNotificationSettings({
        ...notificationSettings,
        ...settings,
      });
      setNotificationSettings(updatedSettings);
      logger.info('Notification settings updated');
      return updatedSettings;
    } catch (error: any) {
      logger.error('Failed to update notification settings', error);
      return null;
    }
  }, [isConnected, notificationSettings]);

  // Update account settings
  const updateAccount = useCallback(async (
    settings: Partial<AccountSettings>
  ): Promise<AccountSettings | null> => {
    if (!isConnected || !accountSettings) return null;

    try {
      const updatedSettings = await profileApi.updateAccountSettings(settings);
      setAccountSettings(updatedSettings);
      logger.info('Account settings updated');
      return updatedSettings;
    } catch (error: any) {
      logger.error('Failed to update account settings', error);
      return null;
    }
  }, [isConnected, accountSettings]);

  // Terminate session
  const terminateSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await profileApi.terminateSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      logger.info('Session terminated');
    } catch (error: any) {
      logger.error('Failed to terminate session', error);
    }
  }, []);

  // Terminate all sessions
  const terminateAllSessions = useCallback(async (): Promise<void> => {
    try {
      await profileApi.terminateAllSessions();
      setSessions(prev => prev.filter(session => session.current));
      logger.info('All sessions terminated');
    } catch (error: any) {
      logger.error('Failed to terminate all sessions', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeProfile();
  }, [initializeProfile]);

  // Refresh profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    await initializeProfile();
  }, [initializeProfile]);

  return {
    // Data
    profile,
    stats,
    achievements,
    sessions,
    privacySettings,
    notificationSettings,
    accountSettings,
    isOwnProfile,

    // Actions
    loadProfile,
    updateProfile,
    uploadAvatar,
    uploadCoverImage,
    pickImage,
    takePhoto,
    updatePrivacy,
    updateNotifications,
    updateAccount,
    terminateSession,
    terminateAllSessions,
    refreshProfile,

    // Derived states
    isLoading: appIsLoading,
    hasAchievements: (achievements || []).length > 0,
    hasMultipleSessions: (sessions || []).length > 1,
  };
};