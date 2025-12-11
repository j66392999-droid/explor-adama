import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { TimeSlot } from '../types/booking.types';
import { formatTime } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface TimeSlotPickerProps {
  eventId: string;
  selectedDate: string;
  selectedSlotId?: string;
  onSlotSelect: (slotId: string) => void;
  style?: any;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  eventId,
  selectedDate,
  selectedSlotId,
  onSlotSelect,
  style,
}) => {
  const { colors } = useTheme();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you would fetch time slots from an API
  useEffect(() => {
    const loadTimeSlots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockSlots: TimeSlot[] = [
          {
            id: 'slot_1',
            startTime: '09:00',
            endTime: '11:00',
            available: true,
            price: 500,
            capacity: 20,
            bookedCount: 8,
          },
          {
            id: 'slot_2',
            startTime: '11:30',
            endTime: '13:30',
            available: true,
            price: 500,
            capacity: 20,
            bookedCount: 15,
          },
          {
            id: 'slot_3',
            startTime: '14:00',
            endTime: '16:00',
            available: false,
            price: 500,
            capacity: 20,
            bookedCount: 20,
          },
          {
            id: 'slot_4',
            startTime: '16:30',
            endTime: '18:30',
            available: true,
            price: 600,
            capacity: 15,
            bookedCount: 5,
          },
          {
            id: 'slot_5',
            startTime: '19:00',
            endTime: '21:00',
            available: true,
            price: 700,
            capacity: 10,
            bookedCount: 3,
          },
        ];
        
        setTimeSlots(mockSlots);
      } catch (err) {
        setError('Failed to load time slots');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && selectedDate) {
      loadTimeSlots();
    }
  }, [eventId, selectedDate]);

  const handleSlotSelect = (slotId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSlotSelect(slotId);
  };

  const renderSlot = (slot: TimeSlot) => {
    const isSelected = slot.id === selectedSlotId;
    const availabilityPercentage = slot.capacity 
      ? (slot.bookedCount / slot.capacity) * 100
      : 0;

    let availabilityColor = '#34C759'; // Green
    if (availabilityPercentage > 80) {
      availabilityColor = '#FF9500'; // Orange
    }
    if (!slot.available || availabilityPercentage >= 100) {
      availabilityColor = '#FF3B30'; // Red
    }

    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.slotContainer,
          isSelected && [styles.selectedSlot, { borderColor: colors.primary }],
          !slot.available && styles.unavailableSlot,
        ]}
        onPress={() => slot.available && handleSlotSelect(slot.id)}
        disabled={!slot.available}
        activeOpacity={0.7}
      >
        <View style={styles.slotHeader}>
          <Text style={[
            styles.slotTime,
            isSelected && styles.selectedText,
            !slot.available && styles.unavailableText,
          ]}>
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </Text>
          
          <View style={styles.availabilityBadge}>
            <View style={[styles.availabilityDot, { backgroundColor: availabilityColor }]} />
            <Text style={styles.availabilityText}>
              {slot.available ? 'Available' : 'Full'}
            </Text>
          </View>
        </View>

        <View style={styles.slotDetails}>
          <View style={styles.priceContainer}>
            <Text style={[
              styles.price,
              isSelected && styles.selectedText,
              !slot.available && styles.unavailableText,
            ]}>
              ETB {slot.price?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.priceLabel}>per person</Text>
          </View>

          {slot.capacity && (
            <View style={styles.capacityContainer}>
              <Text style={styles.capacityText}>
                {slot.bookedCount}/{slot.capacity} booked
              </Text>
              <View style={styles.capacityBar}>
                <View 
                  style={[
                    styles.capacityFill,
                    { 
                      width: `${Math.min(availabilityPercentage, 100)}%`,
                      backgroundColor: availabilityColor,
                    }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading time slots...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, style]}>
        <Ionicons name="time" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No time slots available for this date</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {timeSlots.map(renderSlot)}
      </ScrollView>
      
      {selectedSlotId && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>Selected Time:</Text>
          <Text style={[styles.selectedTime, { color: colors.primary }]}>
            {timeSlots.find(s => s.id === selectedSlotId)?.startTime} - {timeSlots.find(s => s.id === selectedSlotId)?.endTime}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  slotContainer: {
    width: 220,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSlot: {
    borderWidth: 2,
    backgroundColor: 'rgba(0,122,255,0.05)',
  },
  unavailableSlot: {
    opacity: 0.5,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedText: {
    color: '#007AFF',
    fontWeight: '700',
  },
  unavailableText: {
    color: '#8E8E93',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    opacity: 0.7,
  },
  slotDetails: {
    gap: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  capacityContainer: {
    gap: 4,
  },
  capacityText: {
    fontSize: 12,
    opacity: 0.6,
  },
  capacityBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 8,
  },
  selectedLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  selectedTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.6,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});