import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface FormProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  scrollable?: boolean;
}

export const Form: React.FC<FormProps> = ({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
}) => {
  const { colors } = useTheme();

  const Container = scrollable ? ScrollView : View;

  const containerProps = scrollable ? {
    contentContainerStyle: [
      styles.scrollContent,
      contentContainerStyle,
      { backgroundColor: colors.background },
    ],
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: "handled" as const,
  } : {};

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}
      {...containerProps}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
});