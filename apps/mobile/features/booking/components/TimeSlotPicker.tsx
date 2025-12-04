import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useBooking } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface TimeSlotPickerProps {
  value: string;
  onChange: (timeSlot: string) => void;
  eventId: string;
  selectedDate: string;
  label?: string;
  disabled?: boolean;
  style?: any;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  value,
  onChange,
  eventId,
  selectedDate,
  label = 'Select Time Slot',
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const { getTimeSlots } = useBooking();
  
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || disabled) {
        setTimeSlots([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const slots = await getTimeSlots(eventId, selectedDate);
        setTimeSlots(slots);
      } catch (err: any) {
        setError('Failed to load time slots');
        console.error('Error fetching time slots:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [eventId, selectedDate, disabled, getTimeSlots]);

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isSlotDisabled = (slot: any) => {
    return !slot.available || disabled;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text + '80' }]}>
            Loading time slots...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!selectedDate) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.placeholderText, { color: colors.text + '80' }]}>
            Please select a date first
          </Text>
        </View>
      </View>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Text style={[styles.placeholderText, { color: colors.text + '80' }]}>
            No time slots available for this date
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {timeSlots.map((slot) => {
          const isSelected = value === slot.id;
          const isDisabled = isSlotDisabled(slot);
          
          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                { 
                  backgroundColor: colors.surface,
                  borderColor: isDisabled 
                    ? colors.border 
                    : isSelected 
                      ? colors.primary 
                      : colors.border,
                },
                isSelected && { backgroundColor: colors.primary + '20' },
                isDisabled && styles.disabledSlot,
              ]}
              onPress={() => !isDisabled && onChange(slot.id)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.timeText,
                  { 
                    color: isDisabled 
                      ? colors.text + '80'
                      : isSelected 
                        ? colors.primary 
                        : colors.text,
                  },
                ]}
              >
                {formatTime(slot.startTime)}
              </Text>
              
              {slot.endTime && (
                <Text
                  style={[
                    styles.endTimeText,
                    { 
                      color: isDisabled 
                        ? colors.text + '80'
                        : isSelected 
                          ? colors.primary 
                          : colors.text + '80',
                    },
                  ]}
                >
                  to {formatTime(slot.endTime)}
                </Text>
              )}
              
              {slot.price !== undefined && slot.price > 0 && (
                <Text
                  style={[
                    styles.priceText,
                    { 
                      color: isDisabled 
                        ? colors.text + '80'
                        : isSelected 
                          ? colors.primary 
                          : '#4CAF50',
                    },
                  ]}
                >
                  ${slot.price.toFixed(2)}
                </Text>
              )}
              
              {!slot.available && (
                <Text style={[styles.availabilityText, { color: colors.error }]}>
                  Full
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  scrollContent: {
    paddingRight: 16,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledSlot: {
    opacity: 0.5,
  },
  timeText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  endTimeText: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
  placeholder: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
  },
});