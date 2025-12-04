import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authApi } from '../services/auth.api';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import useFallbackNavigation from '../../../shared/hooks/navigation/useFallbackNavigation';

export const ForgotPasswordScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setIsSubmitted(true);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          
          <Text variant="large" style={styles.title}>
            Check Your Email
          </Text>
          
          <Text style={styles.message}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <Text style={styles.instruction}>
            Please check your email and follow the instructions to reset your password.
          </Text>

          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Resend Email"
            variant="outline"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="large" style={styles.title}>
            Forgot Password
          </Text>
          
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <Input
            label="Email"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.input}
          />

          <Button
            title="Send Reset Instructions"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Back to Login"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 48,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    marginBottom: 32,
  },
  button: {
    marginBottom: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
  },
  instruction: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 48,
    fontSize: 14,
    lineHeight: 20,
  },
});