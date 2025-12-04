import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginThunk, registerThunk, logoutThunk, getCurrentUserThunk as fetchProfile } from '../store/slices/auth/auth.thunks';
import type { RegisterData } from '../features/auth/types/auth.types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const login = (email: string, password: string) => {
    return dispatch(loginThunk({ email, password })).unwrap();
  };

  const register = (userData: Partial<RegisterData>) => {
    const payload: RegisterData = {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      password: userData.password || '',
      confirmPassword: userData.confirmPassword || '',
      phone: userData.phone,
      acceptTerms: (userData as any).acceptTerms ?? true,
      acceptPrivacy: (userData as any).acceptPrivacy ?? true,
      acceptMarketing: (userData as any).acceptMarketing ?? false,
    };
    return dispatch(registerThunk(payload)).unwrap();
  };

  const getProfile = () => {
    return dispatch(fetchProfile()).unwrap();
  };

  const signOut = () => {
    dispatch(logoutThunk());
  };

  const updateProfile = (userData: any) => {
    // Implementation for updating profile
  };

  return {
    user: auth.user,
    token: auth.tokens?.accessToken || null,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    register,
    getProfile,
    logout: signOut,
    updateUser: updateProfile,
  };
};