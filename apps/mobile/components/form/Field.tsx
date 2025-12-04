import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Text } from '../../components/ui/Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';

interface FieldProps {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
  containerStyle?: any;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  helper,
  required = false,
  children,
  containerStyle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {label}
          </Text>
          {required && (
            <Text style={[styles.required, { color: colors.error }]}>
              *
            </Text>
          )}
        </View>
      )}
      
      {children}
      
      {(error || helper) && (
        <Text 
          style={[
            styles.helper,
            { color: error ? colors.error : colors.text + '80' }
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
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  required: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  helper: {
    fontSize: 12,
    marginTop: 4,
  },
});