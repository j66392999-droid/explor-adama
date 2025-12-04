import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import {
  loginThunk,
  registerThunk,
  logoutThunk,
  refreshTokenThunk,
} from '../store/auth.thunks';
import {
  clearError,
  updateUser,
  updateTokens,
} from '../store/auth.slice';
import { LoginCredentials, RegisterData, User } from '../types/auth.types';
import { authApi } from '../services/auth.api';
import { storage } from '../../../shared/services/storage/asyncStorage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginThunk(credentials)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const result = await dispatch(registerThunk(userData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (error) {
      // Even if API call fails, clear local data
      storage.clearToken();
      // clear refresh token by setting it to an empty string (clearRefreshToken doesn't exist)
      await storage.setRefreshToken('');
      dispatch(logoutThunk.fulfilled(undefined, ''));
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshTokenThunk()).unwrap();
      return result;
    } catch (error) {
      await logout();
      throw error;
    }
  }, [dispatch, logout]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      dispatch(updateUser(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
    } catch (error) {
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string, confirmPassword: string) => {
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
    } catch (error) {
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    try {
      // This would call your email verification API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      // This would call your resend verification API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return { success: true };
    } catch (error) {
      throw error;
    }
  }, []);

  // Social login methods (stubs for now)
  const socialLogin = useCallback(async (provider: string, token: string) => {
    try {
      // This would call your social login API
      console.log(`Social login with ${provider}`, token);

      // Minimal stub implementation: create a fake auth response and store tokens locally.
      const fakeUser = {
        id: 'local_social_user',
        email: `user+${provider}@example.com`,
        role: 'TOURIST',
        profile: { name: `${provider} user` },
        banned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;

      const fakeTokens = {
        accessToken: `local-access-token-${Date.now()}`,
        refreshToken: `local-refresh-token-${Date.now()}`,
        expiresIn: 60 * 60 * 24,
      };

      // Persist tokens in storage
      await storage.setToken(fakeTokens.accessToken);
      await storage.setRefreshToken(fakeTokens.refreshToken);

      // Update redux state
      dispatch(updateUser(fakeUser));
      dispatch(updateTokens({ accessToken: fakeTokens.accessToken, refreshToken: fakeTokens.refreshToken }));

      return { user: fakeUser, tokens: fakeTokens } as any;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    // State
    ...authState,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    resetError,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    socialLogin,
    
    // Derived state
    isLoggedIn: authState.isAuthenticated,
    isAdmin: authState.user?.role === 'ADMIN',
    isTourist: authState.user?.role === 'TOURIST',
    isResident: authState.user?.role === 'RESIDENT',
  };
};

export type UseAuthReturnType = ReturnType<typeof useAuth>;