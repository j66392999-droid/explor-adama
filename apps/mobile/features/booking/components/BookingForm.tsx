import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Event } from '../../home/types/home.types';
import { GuestCounter } from './GuestCounter';
import { DatePicker } from './DatePicker';
import { TimeSlotPicker } from './TimeSlotPicker';
import { useBooking } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface BookingFormProps {
  event: Event;
  onSubmit: (bookingData: any) => void;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  event,
  onSubmit,
  isLoading = false,
}) => {
  const { colors } = useTheme();
  const { calculateSummary, validateBooking, checkAvailability } = useBooking();
  
  const [formData, setFormData] = useState({
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '',
    specialRequests: '',
  });
  const [availability, setAvailability] = useState<any>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check availability when form data changes
  useEffect(() => {
    const checkAvailability = async (id: string, date: string, timeSlot: string) => {
      if (!formData.date) return;

      setIsCheckingAvailability(true);
      try {
        const availabilityResult = await checkAvailability(
          event.id,
          formData.date,
          formData.timeSlot
        );
        setAvailability(availabilityResult);
      } catch (error) {
        console.error('Failed to check availability:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability(event.id, formData.date, formData.timeSlot);
  }, [event.id, formData.date, formData.timeSlot, checkAvailability]);

  const calculateTotal = () => {
    return calculateSummary(event, formData.quantity);
  };

  const handleSubmit = () => {
    const validationError = validateBooking(
      { ...formData, eventId: event.id },
      event
    );

    if (validationError) {
      let message = '';
      if (typeof validationError === 'string') {
        message = validationError;
      } else if (Array.isArray(validationError)) {
        message = validationError.join('\n');
      } else if (validationError && (validationError as any).message) {
        message = (validationError as any).message;
      } else {
        try {
          message = JSON.stringify(validationError);
        } catch {
          message = 'Invalid booking information';
        }
      }

      Alert.alert('Error', message);
      return;
    }

    if (availability && !availability.available) {
      Alert.alert('Not Available', 'The selected date/time is no longer available. Please choose another option.');
      return;
    }

    const totals = calculateTotal();
    
    onSubmit({
      eventId: event.id,
      ...formData,
      ...totals,
    });
  };

  const totals = calculateTotal();
  const isAvailable = availability?.available !== false;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text variant="large" style={styles.title}>Book Tickets</Text>
      
      <View style={styles.eventInfo}>
        <Text variant="large" numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventDate}>
          {new Date(event.date).toLocaleDateString()}
        </Text>
        {event.place && (
          <Text style={styles.eventLocation}>{event.place.name}</Text>
        )}
        {event.price !== undefined && event.price > 0 && (
          <Text style={styles.eventPrice}>
            ${event.price.toFixed(2)} per ticket
          </Text>
        )}
      </View>

      {/* Availability Status */}
      {formData.date && (
        <View style={[
          styles.availabilityStatus,
          { backgroundColor: isAvailable ? '#E8F5E8' : '#FFEBEE' }
        ]}>
          <Text style={[
            styles.availabilityText,
            { color: isAvailable ? '#4CAF50' : '#F44336' }
          ]}>
            {isCheckingAvailability 
              ? 'Checking availability...' 
              : isAvailable 
                ? `✓ ${availability?.availableSpots || 'Multiple'} spots available`
                : '✗ Not available for selected date/time'
            }
          </Text>
        </View>
      )}

      <GuestCounter
        value={formData.quantity}
        onChange={(value) => updateFormData('quantity', value)}
        maxGuests={event.capacity}
        disabled={!isAvailable}
        style={styles.section}
      />

      <DatePicker
        value={formData.date}
        onChange={(date) => updateFormData('date', date)}
        minDate={new Date().toISOString().split('T')[0]}
        disabled={!event.date}
        style={styles.section}
      />

      {event.startTime && (
        <TimeSlotPicker
          value={formData.timeSlot}
          onChange={(slot) => updateFormData('timeSlot', slot)}
          eventId={event.id}
          selectedDate={formData.date}
          disabled={!isAvailable}
          style={styles.section}
        />
      )}

      <Input
        label="Special Requests"
        placeholder="Any special requirements or notes..."
        value={formData.specialRequests}
        onChangeText={(value) => updateFormData('specialRequests', value)}
        multiline
        numberOfLines={3}
        style={styles.section}
        disabled={!isAvailable}
      />

      <View style={[styles.summary, { backgroundColor: colors.surface }]}>
        <Text variant="small" style={styles.summaryTitle}>Booking Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text>Tickets ({formData.quantity} x ${event.price?.toFixed(2)})</Text>
          <Text>${totals.subTotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text>Tax (15%)</Text>
          <Text>${totals.tax.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text>Service Fee</Text>
          <Text>${totals.fees.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text variant="small">Total</Text>
          <Text variant="small" style={styles.totalAmount}>
            ${totals.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <Button
        title={isAvailable ? "Continue to Payment" : "Not Available"}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={!isAvailable || isLoading}
        fullWidth
        style={styles.bookButton}
      />

      <View style={styles.note}>
        <Text style={styles.noteText}>
          • Free cancellation up to 24 hours before the event{'\n'}
          • Tickets will be sent to your email{'\n'}
          • Present QR code at entrance
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  eventInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  eventDate: {
    marginTop: 4,
    opacity: 0.8,
    fontSize: 14,
  },
  eventLocation: {
    marginTop: 2,
    opacity: 0.6,
    fontSize: 14,
  },
  eventPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  availabilityStatus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  availabilityText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  summary: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 12,
    marginTop: 8,
  },
  totalAmount: {
    color: '#4CAF50',
  },
  bookButton: {
    marginBottom: 16,
  },
  note: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
});