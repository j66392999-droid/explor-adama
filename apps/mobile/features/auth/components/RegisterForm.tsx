import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Text } from '../../../components/ui/Typography/Text';
import { Checkbox } from '../../../components/ui/Checkbox';
import { registerThunk } from '../store/auth.thunks';
import { clearError } from '../store/auth.slice';
import { RegisterData } from '../types/auth.types';
import { AuthConstants } from '../constants/auth.constants';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface RegisterFormProps {
  onLogin?: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onLogin,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    }

    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
    }

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!AuthConstants.EMAIL_REGEX.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (formData.phone && !AuthConstants.PHONE_REGEX.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < AuthConstants.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${AuthConstants.PASSWORD_MIN_LENGTH} characters`);
    } else if (!AuthConstants.PASSWORD_REGEX.test(formData.password)) {
      errors.push('Password must include at least one letter and one number');
    }

    if (!formData.confirmPassword) {
      errors.push('Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!formData.acceptTerms) {
      errors.push('You must accept the Terms and Conditions');
    }

    if (!formData.acceptPrivacy) {
      errors.push('You must accept the Privacy Policy');
    }

    if (errors.length > 0) {
      Alert.alert('Please check your information', errors.join('\n• '));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(registerThunk({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        acceptTerms: formData.acceptTerms,
        confirmPassword: '',
        acceptPrivacy: false
      })).unwrap();

      onSuccess?.();
    } catch (error: any) {
      // Error is handled by the thunk
      console.log('Registration error:', error);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.nameRow}>
        <Input
          label="First Name"
          placeholder="John"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
          autoComplete="name-given"
          containerStyle={styles.nameInput}
          leftIcon="user"
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
          autoComplete="name-family"
          containerStyle={styles.nameInput}
        />
      </View>

      <Input
        label="Email Address"
        placeholder="john@example.com"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        containerStyle={styles.input}
        leftIcon="mail"
      />

      <Input
        label="Phone Number (Optional)"
        placeholder="+251 912 345 678"
        value={formData.phone ?? ''}
        onChangeText={(value) => handleInputChange('phone', value)}
        keyboardType="phone-pad"
        autoComplete="tel"
        containerStyle={styles.input}
        leftIcon="phone"
      />

      <Input
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry={!showPassword}
        autoComplete="password-new"
        containerStyle={styles.input}
        leftIcon="lock"
        rightIcon={showPassword ? 'eye-off' : 'eye'}
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        secureTextEntry={!showConfirmPassword}
        autoComplete="password-new"
        containerStyle={styles.input}
        leftIcon="lock"
        rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Password must contain:</Text>
        <Text style={[
          styles.requirement,
          formData.password.length >= AuthConstants.PASSWORD_MIN_LENGTH && styles.requirementMet
        ]}>
          • At least {AuthConstants.PASSWORD_MIN_LENGTH} characters
        </Text>
        <Text style={[
          styles.requirement,
          /[A-Za-z]/.test(formData.password) && styles.requirementMet
        ]}>
          • At least one letter
        </Text>
        <Text style={[
          styles.requirement,
          /\d/.test(formData.password) && styles.requirementMet
        ]}>
          • At least one number
        </Text>
      </View>

      <View style={styles.checkboxes}>
        <View style={styles.checkbox}>
          <Checkbox
            label="I agree to the Terms and Conditions"
            checked={formData.acceptTerms}
            onPress={(checked) => handleInputChange('acceptTerms', checked)}
          />
        </View>
        
        <View style={styles.checkbox}>
          <Checkbox
            label="I agree to the Privacy Policy"
            checked={formData.acceptPrivacy}
            onPress={(checked) => handleInputChange('acceptPrivacy', checked)}
          />
        </View>
        
        <View style={styles.checkbox}>
          <Checkbox
            label="Send me marketing promotions and updates"
            checked={!!formData.acceptMarketing}
            onPress={(checked) => handleInputChange('acceptMarketing', checked)}
          />
        </View>
      </View>

      <Button
        title="Create Account"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={styles.registerButton}
      />

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  passwordRequirements: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  requirement: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  requirementMet: {
    opacity: 1,
    color: '#4CAF50',
  },
  checkboxes: {
    marginBottom: 24,
  },
  checkbox: {
    marginBottom: 12,
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginLink: {
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