import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: any;
  padding?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  style,
  padding = true,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    padding: 16,
  },
});