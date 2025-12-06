import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import responsive from '../../../shared/utils/responsive';

interface LabelProps {
  children: React.ReactNode;
  style?: any;
  required?: boolean;
  disabled?: boolean;
  numberOfLines?: number;
}

export const Label: React.FC<LabelProps> = ({
  children,
  style,
  required = false,
  disabled = false,
  numberOfLines,
}) => {
  const { colors, typography } = useTheme();

  return (
    <Text
      style={[
        {
          ...typography.label,
          fontSize: responsive.moderateScale((typography.label.fontSize as number) || 14),
        },
        { color: disabled ? colors.text + '80' : colors.text },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
      {required && (
        <Text style={[styles.required, { color: colors.error }]}>
          *
        </Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  required: {
    marginLeft: 2,
  },
});