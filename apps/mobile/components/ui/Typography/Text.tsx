import React from 'react';
import {
  Text as RNText,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import responsive from '../../../shared/utils/responsive';

interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'caption' | 'small' | 'large' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  style?: any;
  numberOfLines?: number;
  onPress?: () => void;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  style,
  numberOfLines,
  onPress,
}) => {
  const { colors, typography } = useTheme();

  const getVariantStyle = () => {
    const v = (() => {
      switch (variant) {
        case 'h1': return typography.h1;
        case 'h2': return typography.h2;
        case 'h3': return typography.h3;
        case 'h4': return typography.h4;
        case 'h5': return typography.h5;
        case 'h6': return typography.h6;
        case 'label': return typography.label;
        case 'body': return typography.body;
        case 'caption': return typography.caption;
        case 'small': return typography.small;
        case 'large': return typography.large;
        default: return typography.body;
      }
    })();

    return {
      fontSize: responsive.moderateScale(v.fontSize || 16),
      lineHeight: v.lineHeight ? responsive.moderateScale(v.lineHeight) : undefined,
      fontWeight: v.fontWeight as any,
    };
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        { color: colors.text },
        onPress && styles.pressable,
        style,
      ]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  pressable: {
    // Add any pressable-specific styles
  },
});