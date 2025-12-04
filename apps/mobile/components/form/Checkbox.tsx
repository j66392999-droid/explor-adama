import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { Text } from '../../components/ui/Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  containerStyle?: any;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  disabled = false,
  error,
  containerStyle,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      onPress(!checked);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.checkboxContainer,
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: error 
                ? colors.error 
                : checked 
                  ? colors.primary 
                  : colors.border,
              backgroundColor: checked ? colors.primary : 'transparent',
            },
            checked && styles.checkboxChecked,
            disabled && styles.checkboxDisabled,
          ]}
        >
          {checked && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
        
        <Text
          style={[
            styles.label,
            { color: colors.text },
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  labelDisabled: {
    opacity: 0.6,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 32,
  },
});