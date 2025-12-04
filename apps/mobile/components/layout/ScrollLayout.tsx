import React from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface ScrollLayoutProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  refreshControl?: {
    refreshing: boolean;
    onRefresh: () => void;
  };
  showsVerticalScrollIndicator?: boolean;
}

export const ScrollLayout: React.FC<ScrollLayoutProps> = ({
  children,
  style,
  contentContainerStyle,
  refreshControl,
  showsVerticalScrollIndicator = false,
}) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        contentContainerStyle,
      ]}
      refreshControl={
        refreshControl ? (
          <RefreshControl
            refreshing={refreshControl.refreshing}
            onRefresh={refreshControl.onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});