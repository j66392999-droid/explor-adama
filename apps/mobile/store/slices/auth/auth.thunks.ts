import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../../features/auth/services/auth.api';
import { secureStorage } from '../../../shared/services/storage/secureStorage';
import { UserData } from '../../../shared/services/storage/storage.types';
import { logger } from '../../../shared/utils/logging/logger';
import { 
  setLoading, 
  setError, 
  loginSuccess, 
  logout, 
  updateTokens,
  updateUser 
} from './auth.slice';
import { LoginCredentials, RegisterData } from '../../../features/auth/types/auth.types';

// Login thunk
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      logger.debug('loginThunk: attempting login with credentials', { email: credentials.email });
      dispatch(setError(null));

      const response = await authApi.login(credentials);
      
      // Store tokens securely
      await secureStorage.setToken(response.tokens.accessToken);
      await secureStorage.setRefreshToken(response.tokens.refreshToken);
      await secureStorage.setUserData(response.user as unknown as UserData);

      dispatch(loginSuccess(response));
      
      logger.info('User logged in successfully', { userId: response.user.id });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      logger.error('loginThunk: login failed', error);
      dispatch(setError(errorMessage));
      logger.error('Login failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Register thunk
export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await authApi.register(userData);
      
      // Store tokens securely
      await secureStorage.setToken(response.tokens.accessToken);
      await secureStorage.setRefreshToken(response.tokens.refreshToken);
      await secureStorage.setUserData(response.user as unknown as UserData);

      dispatch(loginSuccess(response));
      
      logger.info('User registered successfully', { userId: response.user.id });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(setError(errorMessage));
      logger.error('Registration failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout thunk
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Call logout API
      await authApi.logout();
      
      // Clear stored data
      await secureStorage.clearAuth();
      
      dispatch(logout());
      
      logger.info('User logged out successfully');
      return { success: true };
    } catch (error: any) {
      // Even if API call fails, clear local data
      await secureStorage.clearAuth();
      dispatch(logout());
      
      logger.warn('Logout API call failed, but local data cleared', error);
      return rejectWithValue('Logout completed locally');
    }
  }
);

// Refresh token thunk
export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      
      // Update stored tokens
      await secureStorage.setToken(response.tokens.accessToken);
      if (response.tokens.refreshToken) {
        await secureStorage.setRefreshToken(response.tokens.refreshToken);
      }

      dispatch(updateTokens(response.tokens));
      
      logger.debug('Token refreshed successfully');
      return response;
    } catch (error: any) {
      // Clear tokens on refresh failure
      await secureStorage.clearAuth();
      dispatch(logout());
      
      const errorMessage = error.response?.data?.message || error.message || 'Token refresh failed';
      logger.error('Token refresh failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get current user thunk
export const getCurrentUserThunk = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      const user = await authApi.getCurrentUser();
      await secureStorage.setUserData(user as unknown as UserData);

      dispatch(updateUser(user));
      dispatch(setLoading(false));
      
      logger.debug('Current user data loaded', { userId: user.id });
      return user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get user data';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      logger.error('Failed to get current user', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update profile thunk
export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: any, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(setLoading(true));

      const updatedUser = await authApi.updateProfile(profileData);
      await secureStorage.setUserData(updatedUser as unknown as UserData);

      dispatch(updateUser(updatedUser));
      dispatch(setLoading(false));
      
      logger.info('Profile updated successfully', { userId: updatedUser.id });
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      logger.error('Profile update failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Forgot password thunk
export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await authApi.forgotPassword({ email });
      
      logger.info('Password reset email sent', { email });
      return { success: true, email };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      logger.error('Forgot password failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Reset password thunk
export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      await authApi.resetPassword(data);
      
      logger.info('Password reset successfully');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      logger.error('Password reset failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Check authentication status thunk
export const checkAuthStatusThunk = createAsyncThunk(
  'auth/checkStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const [token, userData] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUserData(),
      ]);

      if (token && userData) {
        // Verify token is still valid by making a simple API call
        try {
          const currentUser = await authApi.getCurrentUser();
          dispatch(loginSuccess({
            user: currentUser,
            tokens: {
              accessToken: token,
              refreshToken: await secureStorage.getRefreshToken(),
              expiresIn: 60 * 60 * 24,
            },
          }));
          
          logger.debug('Auth status: Authenticated', { userId: currentUser.id });
          return { isAuthenticated: true, user: currentUser };
        } catch (error) {
          // Token is invalid, clear auth data
          await secureStorage.clearAuth();
          dispatch(logout());
          
          logger.warn('Token validation failed, user logged out', error);
          return { isAuthenticated: false, user: null };
        }
      }

      dispatch(logout());
      logger.debug('Auth status: Not authenticated');
      return { isAuthenticated: false, user: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to check auth status';
      logger.error('Auth status check failed', error);
      return rejectWithValue(errorMessage);
    }
  }
);