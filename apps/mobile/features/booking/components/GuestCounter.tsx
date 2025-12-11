import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { GuestCount } from '../types/booking.types';
import * as Haptics from 'expo-haptics';

interface GuestCounterProps {
  guests: GuestCount;
  onChange: (guests: GuestCount) => void;
  maxGuests?: number;
  error?: string;
  style?: any;
}

export const GuestCounter: React.FC<GuestCounterProps> = ({
  guests,
  onChange,
  maxGuests = 10,
  error,
  style,
}) => {
  const { colors } = useTheme();

  const totalGuests = guests.adults + guests.children + guests.infants;

  const updateGuestCount = (type: keyof GuestCount, increment: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newCount = guests[type] + (increment ? 1 : -1);
    
    if (newCount < 0) return;
    
    // Check max guests limit
    if (increment && totalGuests >= maxGuests) {
      return;
    }

    onChange({
      ...guests,
      [type]: newCount,
    });
  };

  const renderCounter = (
    label: string,
    description: string,
    count: number,
    type: keyof GuestCount,
    minCount: number = 0
  ) => (
    <View style={styles.counterRow}>
      <View style={styles.counterInfo}>
        <Text style={styles.counterLabel}>{label}</Text>
        <Text style={styles.counterDescription}>{description}</Text>
      </View>
      
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[
            styles.counterButton,
            count <= minCount && styles.disabledButton,
          ]}
          onPress={() => updateGuestCount(type, false)}
          disabled={count <= minCount}
        >
          <Ionicons
            name="remove"
            size={20}
            color={count <= minCount ? colors.textTertiary : colors.text}
          />
        </TouchableOpacity>
        
        <Text style={styles.counterValue}>{count}</Text>
        
        <TouchableOpacity
          style={[
            styles.counterButton,
            totalGuests >= maxGuests && styles.disabledButton,
          ]}
          onPress={() => updateGuestCount(type, true)}
          disabled={totalGuests >= maxGuests}
        >
          <Ionicons
            name="add"
            size={20}
            color={totalGuests >= maxGuests ? colors.textTertiary : colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {renderCounter(
        'Adults',
        'Ages 13+',
        guests.adults,
        'adults',
        1
      )}
      
      {renderCounter(
        'Children',
        'Ages 2-12',
        guests.children,
        'children'
      )}
      
      {renderCounter(
        'Infants',
        'Under 2',
        guests.infants,
        'infants'
      )}
      
      <View style={styles.summary}>
        <Text style={styles.totalLabel}>Total Guests</Text>
        <Text style={styles.totalValue}>{totalGuests}</Text>
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
      
      {maxGuests && (
        <Text style={[styles.maxGuests, { color: colors.textSecondary }]}>
          Maximum {maxGuests} guests allowed
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  counterInfo: {
    flex: 1,
  },
  counterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  counterDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  maxGuests: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});