import React from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../ui/Typography/Text';
import { Button } from '../ui/Button';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface ErrorStateProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  image?: any;
  style?: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  title = 'Something Went Wrong',
  onRetry,
  image,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="contain" />
      ) : (
        <Text style={[styles.icon, { color: colors.error }]}>
          ⚠️
        </Text>
      )}
      
      <Text variant="large" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: colors.text + '80' }]}>
        {message}
      </Text>
      
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
});