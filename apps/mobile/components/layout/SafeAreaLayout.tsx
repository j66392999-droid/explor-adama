import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  style?: any;
}

export const SafeAreaLayout: React.FC<SafeAreaLayoutProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});