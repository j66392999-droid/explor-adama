import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthResponse } from '../types/auth.types';
import { loginThunk, registerThunk, logoutThunk, refreshTokenThunk } from './auth.thunks';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  lastActivity: Date.now(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update user data
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Update tokens
    updateTokens: (state, action: PayloadAction<AuthState['tokens']>) => {
      state.tokens = action.payload;
    },

    // Update last activity timestamp
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Reset auth state
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
        // Still clear local state even if API call fails
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Refresh Token
    builder
      .addCase(refreshTokenThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.tokens = action.payload.tokens;
        state.lastActivity = Date.now();
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.isLoading = false;
        // Token refresh failed, logout user
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  updateUser,
  updateTokens,
  updateLastActivity,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;