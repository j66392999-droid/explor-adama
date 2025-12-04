import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface HeadingProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  style?: any;
  numberOfLines?: number;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  variant = 'h1',
  style,
  numberOfLines,
}) => {
  const { colors, typography } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1': return typography.h1;
      case 'h2': return typography.h2;
      case 'h3': return typography.h3;
      case 'h4': return typography.h4;
      case 'h5': return typography.h5;
      case 'h6': return typography.h6;
      default: return typography.h1;
    }
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        { color: colors.text },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  // Styles are defined in the theme
});