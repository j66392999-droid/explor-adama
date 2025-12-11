import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  type?: 'navigation' | 'switch' | 'action' | 'destructive';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  rightText?: string;
  disabled?: boolean;
  showChevron?: boolean;
  style?: any;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  type = 'navigation',
  value = false,
  onPress,
  onValueChange,
  rightText,
  disabled = false,
  showChevron = true,
  style,
}) => {
  const { colors } = useTheme();

  const getIconColor = () => {
    switch (type) {
      case 'destructive':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'destructive':
        return colors.error;
      default:
        return disabled ? colors.textTertiary : colors.text;
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleValueChange = (newValue: boolean) => {
    if (!disabled && onValueChange) {
      onValueChange(newValue);
    }
  };

  const renderRightContent = () => {
    if (type === 'switch') {
      return (
        <Switch
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
          thumbColor={value ? colors.onPrimary : colors.surface}
        />
      );
    }

    if (rightText) {
      return (
        <Text style={[styles.rightText, { color: colors.textSecondary }]}>
          {rightText}
        </Text>
      );
    }

    if (showChevron && type === 'navigation') {
      return (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textTertiary}
        />
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || (type !== 'navigation' && type !== 'action')}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as any, {
                color: getIconColor(),
                size: 22,
              })
            : null}
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: getTextColor() },
            type === 'destructive' && styles.destructiveText,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary },
              disabled && { color: colors.textTertiary },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightContent}>
        {renderRightContent()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  destructiveText: {
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
  },
  rightContent: {
    marginLeft: 12,
  },
  rightText: {
    fontSize: 14,
  },
});