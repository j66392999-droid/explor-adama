import { UserProfile } from '../../social/types/social.types';

export interface ExtendedProfile extends UserProfile {
  joinedDate: string;
  location?: string;
  website?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  stats?: {
    postsPerDay?: number;
    avgLikes?: number;
    avgComments?: number;
    engagementRate?: number;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      likes: boolean;
      comments: boolean;
      follows: boolean;
      mentions: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showOnlineStatus: boolean;
      allowTagging: boolean;
    };
  };
}

export interface ProfileTab {
  id: string;
  title: string;
  icon: string;
  count?: number;
  type: 'posts' | 'replies' | 'reposts' | 'media' | 'likes';
}

export interface EditProfileData {
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  allowTagging: boolean;
  allowMessages: 'everyone' | 'friends' | 'no_one';
  hideLikes: boolean;
  hideFollowers: boolean;
}

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  reposts: boolean;
  messages: boolean;
  recommendations: boolean;
  marketing: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

export interface AccountSettings {
  email: string;
  phone?: string;
  language: string;
  currency: string;
  timezone: string;
  twoFactorAuth: boolean;
  activeSessions: Session[];
  connectedAccounts: ConnectedAccount[];
}

export interface Session {
  id: string;
  device: string;
  browser?: string;
  location?: string;
  lastActive: string;
  current: boolean;
}

export interface ConnectedAccount {
  provider: 'google' | 'facebook' | 'twitter' | 'apple';
  email: string;
  connectedAt: string;
}

export interface ProfileStats {
  totalPosts: number;
  totalReplies: number;
  totalReposts: number;
  totalLikes: number;
  totalFollowers: number;
  totalFollowing: number;
  streakDays: number;
  engagementRate: number;
}

export interface ProfileAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}