import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type VerificationScreenProps = {
  route: RouteProp<{ params: { email: string } }, 'params'>;
  navigation: any;
};

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  route,
  navigation,
}) => {
  const { email } = route.params;
  const { colors } = useTheme();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const focusNext = (index: number, value: string) => {
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const focusPrevious = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    if (text) {
      focusNext(index, text);
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    const { key } = event.nativeEvent;
    focusPrevious(index, key);
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, assume verification is successful
      Alert.alert(
        'Success',
        'Your email has been verified successfully!',
        [{ text: 'Continue', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setTimeLeft(60);
    // Implement resend code logic here
    Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text variant="large" style={styles.title}>
          Verify Your Email
        </Text>
        
        <Text style={styles.subtitle}>
          We've sent a verification code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                if (ref) inputs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                { 
                  borderColor: digit ? colors.primary : '#E5E5E5',
                  backgroundColor: colors.surface,
                }
              ]}
              value={digit}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={event => handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Verify Email"
          onPress={handleVerify}
          loading={isLoading}
          disabled={!isCodeComplete || isLoading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
          </Text>
          {timeLeft > 0 ? (
            <Text style={styles.timerText}>
              Resend in {timeLeft}s
            </Text>
          ) : (
            <Button
              title="Resend Code"
              variant="ghost"
              onPress={handleResendCode}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
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
  email: {
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    opacity: 0.7,
  },
  timerText: {
    color: '#666',
    fontWeight: '600',
  },
});