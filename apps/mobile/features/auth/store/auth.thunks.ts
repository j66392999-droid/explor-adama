import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../services/auth.api';
import { LoginCredentials, RegisterData } from '../types/auth.types';
import { storage } from '../../../shared/services/storage/asyncStorage';
import { logout } from '@/store/slices/auth/auth.slice';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await authApi.login(credentials);
      
      // Store tokens in secure storage
      await storage.setToken(response.tokens.accessToken);
      await storage.setRefreshToken(response.tokens.refreshToken);
      
      return response;
    } catch (error: any) {
      // Support ApiError thrown by ApiClient or Axios error
      const msg = error?.message || error?.data?.message || (error?.code ? error.code : 'Login failed');
      return rejectWithValue(msg);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      
      // Store tokens
      await storage.setToken(response.tokens.accessToken);
      await storage.setRefreshToken(response.tokens.refreshToken);
      
      return response;
    } catch (error: any) {
      const msg = error?.message || error?.data?.message || (error?.code ? error.code : 'Registration failed');
      return rejectWithValue(msg);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed, clearing local data anyway');
    } finally {
      // Clear storage
      await storage.clearToken();
      await storage.clearRefreshToken();
      
      // Clear Redux state
      dispatch(logout());
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refreshToken(refreshToken);
      
      // Update stored tokens
      await storage.setToken(response.tokens.accessToken);
      await storage.setRefreshToken(response.tokens.refreshToken);
      
      return response;
    } catch (error: any) {
      // Clear tokens on refresh failure
      await storage.clearToken();
      await storage.clearRefreshToken();
      
      return rejectWithValue(
        error.response?.data?.message || 'Token refresh failed'
      );
    }
  }
);