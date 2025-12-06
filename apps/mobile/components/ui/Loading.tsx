import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Text } from './Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';
import responsive from '../../shared/utils/responsive';

interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
  style?: any;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  message,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.text + '80' }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.moderateScale(40),
  },
  message: {
    marginTop: responsive.moderateScale(16),
    textAlign: 'center',
  },
});