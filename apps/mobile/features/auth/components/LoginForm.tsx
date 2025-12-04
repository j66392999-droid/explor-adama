import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Text } from '../../../components/ui/Typography/Text';
import { Checkbox } from '../../../components/ui/Checkbox';
import { loginThunk } from '../store/auth.thunks';
import { clearError } from '../store/auth.slice';
import { logger } from '../../../shared/utils/logging/logger';
import { LoginCredentials } from '../types/auth.types';
import { AuthConstants } from '../constants/auth.constants';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface LoginFormProps {
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onForgotPassword,
  onSignUp,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = (): boolean => {
    if (!credentials.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!credentials.password) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }

    if (credentials.password.length < AuthConstants.PASSWORD_MIN_LENGTH) {
      Alert.alert('Error', `Password must be at least ${AuthConstants.PASSWORD_MIN_LENGTH} characters`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      logger.debug('LoginForm: submitting credentials', credentials);
      const result = await dispatch(loginThunk(credentials)).unwrap();
      logger.debug('LoginForm: login result', result);
      // Navigation is handled by the auth flow in the component
    } catch (error: any) {
      // Error is handled by the thunk and displayed in the state
      try { logger.error('LoginForm: login error', error); } catch { console.log('Login error:', error) }
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <Input
        label="Email Address"
        placeholder="Enter your email"
        value={credentials.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        containerStyle={styles.input}
        leftIcon="mail"
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        value={credentials.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry={!showPassword}
        autoComplete="password"
        containerStyle={styles.input}
        leftIcon="lock"
        rightIcon={showPassword ? 'eye-off' : 'eye'}
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      <View style={styles.optionsRow}>
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onPress={setRememberMe}
        />
        
        <TouchableOpacity onPress={onForgotPassword}>
          <Text style={[styles.forgotPassword, { color: colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Sign In"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={styles.loginButton}
      />

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onSignUp}>
          <Text style={[styles.signupLink, { color: colors.primary }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPassword: {
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signupLink: {
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
});