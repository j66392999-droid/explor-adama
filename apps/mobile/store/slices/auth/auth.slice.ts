import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TOURIST' | 'RESIDENT';
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  profile?: {
    name?: string;
    avatar?: string;
    phone?: string;
    country?: string;
  };
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  lastActivity: number;
  sessionExpiry: number | null;
  
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  lastActivity: Date.now(),
  sessionExpiry: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Authentication actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthState['tokens'] }>) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;
      state.lastActivity = Date.now();
      state.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      state.lastActivity = Date.now();
      state.sessionExpiry = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateTokens: (state, action: PayloadAction<AuthState['tokens']>) => {
      state.tokens = action.payload;
      state.lastActivity = Date.now();
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload;
    },
    resetAuth: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  clearError,
  loginSuccess,
  logout,
  updateUser,
  updateTokens,
  updateLastActivity,
  setSessionExpiry,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;