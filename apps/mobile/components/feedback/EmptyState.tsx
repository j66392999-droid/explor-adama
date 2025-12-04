import React from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../ui/Typography/Text';
import { Button } from '../ui/Button';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
  image?: any;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = '📭',
  image,
  action,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="contain" />
      ) : (
        <Text style={[styles.icon, { color: colors.text + '80' }]}>
          {icon}
        </Text>
      )}
      
  <Text variant="large" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      {message && (
        <Text style={[styles.message, { color: colors.text + '80' }]}>
          {message}
        </Text>
      )}
      
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          style={styles.actionButton}
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
  actionButton: {
    minWidth: 120,
  },
});