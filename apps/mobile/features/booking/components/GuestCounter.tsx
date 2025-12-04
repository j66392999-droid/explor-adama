import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface GuestCounterProps {
  value: number;
  onChange: (value: number) => void;
  minGuests?: number;
  maxGuests?: number;
  label?: string;
  disabled?: boolean;
  style?: any;
}

export const GuestCounter: React.FC<GuestCounterProps> = ({
  value,
  onChange,
  minGuests = 1,
  maxGuests = 10,
  label = 'Number of Tickets',
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const increment = () => {
    if (value < maxGuests) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > minGuests) {
      onChange(value - 1);
    }
  };

  const isMinDisabled = value <= minGuests || disabled;
  const isMaxDisabled = value >= maxGuests || disabled;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
      
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={[
            styles.counterButton,
            { 
              backgroundColor: colors.surface,
              borderColor: isMinDisabled ? colors.border : colors.primary,
            },
            isMinDisabled && styles.disabledButton
          ]}
          onPress={decrement}
          disabled={isMinDisabled}
        >
          <Text style={[
            styles.counterButtonText,
            { color: isMinDisabled ? colors.text + '80' : colors.primary }
          ]}>
            –
          </Text>
        </TouchableOpacity>

        <View style={[styles.countDisplay, { backgroundColor: colors.surface }]}>
          <Text style={[styles.countText, { color: colors.text }]}>
            {value}
          </Text>
          <Text style={[styles.guestText, { color: colors.text + '80' }]}>
            {value === 1 ? 'ticket' : 'tickets'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.counterButton,
            { 
              backgroundColor: colors.surface,
              borderColor: isMaxDisabled ? colors.border : colors.primary,
            },
            isMaxDisabled && styles.disabledButton
          ]}
          onPress={increment}
          disabled={isMaxDisabled}
        >
          <Text style={[
            styles.counterButtonText,
            { color: isMaxDisabled ? colors.text + '80' : colors.primary }
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      {maxGuests && (
        <Text style={[styles.limitText, { color: colors.text + '80' }]}>
          Maximum {maxGuests} tickets per booking
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 14,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  countDisplay: {
    flex: 1,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  guestText: {
    fontSize: 12,
  },
  limitText: {
    fontSize: 12,
    textAlign: 'center',
  },
});