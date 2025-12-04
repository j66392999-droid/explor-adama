import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    searchable: boolean;
    showLocation: boolean;
  };
  travel: {
    preferredCategories: string[];
    budgetRange: {
      min: number;
      max: number;
    };
    groupSize: number;
    travelStyle: 'budget' | 'luxury' | 'adventure' | 'cultural';
  };
}

export interface UserStats {
  totalBookings: number;
  totalReviews: number;
  totalFavorites: number;
  memberSince: string;
  lastActive: string;
}

export interface UserState {
  profile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    country?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
  } | null;
  preferences: UserPreferences;
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

const initialState: UserState = {
  profile: null,
  preferences: {
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
  },
  stats: {
    totalBookings: 0,
    totalReviews: 0,
    totalFavorites: 0,
    memberSince: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  isLoading: false,
  error: null,
  isUpdating: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Profile actions
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserState['profile']>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile: (state) => {
      state.profile = null;
    },

    // Preferences actions
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<UserPreferences['notifications']>>) => {
      state.preferences.notifications = { 
        ...state.preferences.notifications, 
        ...action.payload 
      };
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<UserPreferences['privacy']>>) => {
      state.preferences.privacy = { 
        ...state.preferences.privacy, 
        ...action.payload 
      };
    },
    updateTravelPreferences: (state, action: PayloadAction<Partial<UserPreferences['travel']>>) => {
      state.preferences.travel = { 
        ...state.preferences.travel, 
        ...action.payload 
      };
    },

    // Stats actions
    setStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    incrementBookings: (state) => {
      state.stats.totalBookings += 1;
    },
    incrementReviews: (state) => {
      state.stats.totalReviews += 1;
    },
    incrementFavorites: (state) => {
      state.stats.totalFavorites += 1;
    },
    updateLastActive: (state) => {
      state.stats.lastActive = new Date().toISOString();
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Reset
    resetUser: () => initialState,
  },
});

export const {
  setProfile,
  updateProfile,
  clearProfile,
  setPreferences,
  updateNotificationSettings,
  updatePrivacySettings,
  updateTravelPreferences,
  setStats,
  incrementBookings,
  incrementReviews,
  incrementFavorites,
  updateLastActive,
  setLoading,
  setUpdating,
  setError,
  clearError,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;