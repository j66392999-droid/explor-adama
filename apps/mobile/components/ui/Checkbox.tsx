import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Text } from './Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface CheckboxProps {
  checked: boolean;
  onPress: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
  containerStyle?: any;
  labelStyle?: any;
  testID?: string;
  // Optional error message for form validation
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  size = 'medium',
  color,
  style,
  labelStyle,
  testID,
  error,
  containerStyle,
}) => {
  const { colors, spacing } = useTheme();

  // local Animated.Value to drive scale/opacity
  const animatedScale = React.useRef(new Animated.Value(checked ? 1 : 0)).current;

  const animateTo = (toValue: number, duration = 200) =>
    new Promise<void>((resolve) =>
      Animated.timing(animatedScale, {
        toValue,
        duration,
        useNativeDriver: true,
      }).start(() => resolve())
    );

  const pulse = (toValue: number, duration = 150) =>
    // simple pulse helper: animate to toValue then resolve (caller can chain)
    animateTo(toValue, duration);

  const checkboxColor = color || colors.primary;
  const isDisabled = disabled;

  const getSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      case 'medium':
      default:
        return 20;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 16;
      case 'medium':
      default:
        return 12;
    }
  };

  React.useEffect(() => {
    if (checked) {
      pulse(1.1, 150).then(() => animateTo(1, 100));
    } else {
      animateTo(0, 200);
    }
    // only depend on checked; animatedScale and helpers are stable refs
  }, [checked]);

  const handlePress = () => {
    if (!isDisabled) {
      onPress(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle, style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: getSize(),
            height: getSize(),
            borderRadius: getSize() / 4,
            borderWidth: 2,
            borderColor: isDisabled
              ? colors.border
              : checked
              ? checkboxColor
              : colors.border,
            backgroundColor: isDisabled
              ? colors.surfaceVariant
              : checked
              ? checkboxColor
              : 'transparent',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: animatedScale }],
              opacity: animatedScale,
            },
          ]}
        >
          <Text
            style={[
              styles.checkmark,
              {
                color: colors.onPrimary,
                fontSize: getIconSize(),
              },
            ]}
          >
            ✓
          </Text>
        </Animated.View>
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            {
              color: isDisabled ? colors.textTertiary : colors.text,
              marginLeft: spacing.sm,
            },
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: '#F44336',
  },
});

// Checkbox group component
interface CheckboxGroupProps {
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  direction?: 'horizontal' | 'vertical';
  style?: any;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selectedValues,
  onChange,
  direction = 'vertical',
  style,
}) => {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onChange(newValues);
  };

  return (
    <View
      style={[
        groupStyles.groupContainer,
        direction === 'horizontal' && groupStyles.groupHorizontal,
        style,
      ]}
    >
      {options.map(option => (
        <Checkbox
          key={option.value}
          checked={selectedValues.includes(option.value)}
          onPress={() => handleToggle(option.value)}
          label={option.label}
          disabled={option.disabled}
          style={groupStyles.groupCheckbox}
        />
      ))}
    </View>
  );
};

const groupStyles = StyleSheet.create({
  groupContainer: {
    // Default vertical styles are handled by flexDirection: 'row' in container
  },
  groupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupCheckbox: {
    marginBottom: 8,
    marginRight: 16,
  },
});