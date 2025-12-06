import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';
import responsive from '../../shared/utils/responsive';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  onRightIconPress?: () => void;
  containerStyle?: any;
  style?: any;
  onSubmitEditing?: (event?: any) => void;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onSubmitEditing,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {typeof leftIcon === 'string' ? (
              <Ionicons name={mapIcon(leftIcon)} size={responsive.moderateScale(20)} color={colors.text + '80'} />
            ) : (
              leftIcon
            )}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: leftIcon ? responsive.moderateScale(40) : responsive.moderateScale(16),
              paddingRight: rightIcon ? responsive.moderateScale(40) : responsive.moderateScale(16),
            },
            multiline && styles.multiline,
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '80'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled}
          textAlignVertical={multiline ? 'top' : 'center'}
          onSubmitEditing={onSubmitEditing}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
              {typeof rightIcon === 'string' ? (
              <Ionicons name={mapIcon(rightIcon)} size={responsive.moderateScale(20)} color={colors.text + '80'} />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helper) && (
        <Text
          style={[
            styles.helper,
            { color: error ? colors.error : colors.text + '80' },
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: responsive.moderateScale(16),
  },
  label: {
    marginBottom: responsive.moderateScale(8),
    fontWeight: '600',
    fontSize: responsive.moderateScale(14),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: responsive.moderateScale(8),
    minHeight: responsive.moderateScale(48),
  },
  disabled: {
    opacity: 0.6,
  },
  leftIcon: {
    position: 'absolute',
    left: responsive.moderateScale(12),
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: responsive.moderateScale(12),
    zIndex: 1,
    padding: responsive.moderateScale(4),
  },
  input: {
    flex: 1,
    fontSize: responsive.moderateScale(16),
    minHeight: responsive.moderateScale(48),
  },
  multiline: {
    minHeight: responsive.moderateScale(100),
    paddingTop: responsive.moderateScale(12),
    paddingBottom: responsive.moderateScale(12),
  },
  helper: {
    fontSize: responsive.moderateScale(12),
    marginTop: responsive.moderateScale(4),
  },
});

// Map simple icon names to Ionicons equivalents, extend as needed
function mapIcon(name: string) {
  const mapping: Record<string, string> = {
    user: 'person',
    mail: 'mail',
    phone: 'call',
    lock: 'lock-closed',
    'eye': 'eye',
    'eye-off': 'eye-off',
    calendar: 'calendar',
  }
  return mapping[name] || (name as any)
}