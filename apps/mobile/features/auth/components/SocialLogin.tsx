import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { AuthConstants } from '../constants/auth.constants';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface SocialLoginProps {
  onGoogleLogin?: () => Promise<void>;
  onFacebookLogin?: () => Promise<void>;
  onAppleLogin?: () => Promise<void>;
  isLoading?: boolean;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleLogin,
  onFacebookLogin,
  onAppleLogin,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const handleSocialLogin = async (provider: string, loginFunction?: () => Promise<void>) => {
    if (!loginFunction) {
      Alert.alert('Coming Soon', `${provider} login will be available soon!`);
      return;
    }

    try {
      await loginFunction();
    } catch (error) {
      Alert.alert('Error', `Failed to login with ${provider}`);
    }
  };

  const featureFlags = useAppSelector(state => state.app.featureFlags);

  if (!featureFlags?.social) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.text }]}>
          Or continue with
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <View style={styles.socialButtons}>
        {featureFlags?.social && (
          <>
            <Button
              title="Google"
              variant="outline"
              onPress={() => handleSocialLogin('Google', onGoogleLogin)}
              loading={isLoading}
              disabled={isLoading}
              leftIcon={
                <Text style={styles.socialIcon}>G</Text>
              }
              style={styles.socialButton}
              textStyle={styles.socialButtonText}
            />

            <Button
              title="Facebook"
              variant="outline"
              onPress={() => handleSocialLogin('Facebook', onFacebookLogin)}
              loading={isLoading}
              disabled={isLoading}
              leftIcon={
                <Text style={styles.socialIcon}>f</Text>
              }
              style={styles.socialButton}
              textStyle={styles.socialButtonText}
            />

            {featureFlags?.social && (
              <Button
                title="Apple"
                variant="outline"
                onPress={() => handleSocialLogin('Apple', onAppleLogin)}
                loading={isLoading}
                disabled={isLoading}
                leftIcon={
                  <Text style={styles.socialIcon}>A</Text>
                }
                style={styles.socialButton}
                textStyle={styles.socialButtonText}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.privacyNote}>
        <Text style={[styles.privacyText, { color: colors.text }]}>
          We'll never post to your social media without your permission
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.5,
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    borderColor: '#E5E5E5',
  },
  socialButtonText: {
    fontWeight: '500',
  },
  socialIcon: {
    width: 20,
    height: 20,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  privacyNote: {
    paddingHorizontal: 20,
  },
  privacyText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
});