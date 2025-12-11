import { apiClient } from '../../../shared/services/api/client';
import { PaginatedResponse } from '../../../shared/types/api.types';
import {
  ExtendedProfile,
  EditProfileData,
  PrivacySettings,
  NotificationSettings,
  AccountSettings,
  ProfileStats,
  ProfileAchievement,
  Session,
  ConnectedAccount,
} from '../types/profile.types';

export const profileApi = {
  // Profile
  async getProfile(userId?: string): Promise<ExtendedProfile> {
    const url = userId ? `/profile/${userId}` : '/profile';
    const res = await apiClient.get<ExtendedProfile>(url);
    return res.data!;
  },

  async updateProfile(data: EditProfileData): Promise<ExtendedProfile> {
    const res = await apiClient.put<ExtendedProfile>('/profile', data);
    return res.data!;
  },

  async uploadAvatar(imageUri: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const res = await apiClient.post<{ url: string }>('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data!;
  },

  async uploadCoverImage(imageUri: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('cover', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'cover.jpg',
    } as any);

    const res = await apiClient.post<{ url: string }>('/profile/cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data!;
  },

  // Settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    const res = await apiClient.get<PrivacySettings>('/profile/settings/privacy');
    return res.data!;
  },

  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    const res = await apiClient.put<PrivacySettings>('/profile/settings/privacy', settings);
    return res.data!;
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    const res = await apiClient.get<NotificationSettings>('/profile/settings/notifications');
    return res.data!;
  },

  async updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    const res = await apiClient.put<NotificationSettings>('/profile/settings/notifications', settings);
    return res.data!;
  },

  async getAccountSettings(): Promise<AccountSettings> {
    const res = await apiClient.get<AccountSettings>('/profile/settings/account');
    return res.data!;
  },

  async updateAccountSettings(settings: Partial<AccountSettings>): Promise<AccountSettings> {
    const res = await apiClient.patch<AccountSettings>('/profile/settings/account', settings);
    return res.data!;
  },

  // Stats & Achievements
  async getProfileStats(userId?: string): Promise<ProfileStats> {
    const url = userId ? `/profile/${userId}/stats` : '/profile/stats';
    const res = await apiClient.get<ProfileStats>(url);
    return res.data!;
  },

  async getAchievements(): Promise<ProfileAchievement[]> {
    const res = await apiClient.get<ProfileAchievement[]>('/profile/achievements');
    return res.data!;
  },

  // Sessions
  async getActiveSessions(): Promise<Session[]> {
    const res = await apiClient.get<Session[]>('/profile/sessions');
    return res.data!;
  },

  async terminateSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/profile/sessions/${sessionId}`);
  },

  async terminateAllSessions(): Promise<void> {
    await apiClient.delete('/profile/sessions/all');
  },

  // Connected Accounts
  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    const res = await apiClient.get<ConnectedAccount[]>('/profile/connected-accounts');
    return res.data!;
  },

  async disconnectAccount(provider: string): Promise<void> {
    await apiClient.delete(`/profile/connected-accounts/${provider}`);
  },

  // Verification
  async requestVerification(data: {
    fullName: string;
    idType: string;
    idNumber: string;
    documentUrl: string;
  }): Promise<{ requestId: string; status: string }> {
    const res = await apiClient.post<{ requestId: string; status: string }>(
      '/profile/verification',
      data
    );
    return res.data!;
  },

  async getVerificationStatus(): Promise<{
    verified: boolean;
    status?: string;
    requestedAt?: string;
    verifiedAt?: string;
  }> {
    const res = await apiClient.get<{
      verified: boolean;
      status?: string;
      requestedAt?: string;
      verifiedAt?: string;
    }>('/profile/verification/status');
    return res.data!;
  },
};