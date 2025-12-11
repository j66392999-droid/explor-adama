import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { DatePicker } from './DatePicker';
import { GuestCounter } from './GuestCounter';
import { TimeSlotPicker } from './TimeSlotPicker';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { BookingFormData, GuestCount } from '../types/booking.types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface BookingFormProps {
  eventId?: string;
  placeId?: string;
  eventTitle?: string;
  placeName?: string;
  basePrice: number;
  maxGuests?: number;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  eventId,
  placeId,
  eventTitle,
  placeName,
  basePrice,
  maxGuests = 10,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState<BookingFormData>({
    eventId,
    placeId,
    date: new Date().toISOString().split('T')[0],
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    contactInfo: {
      fullName: '',
      email: '',
      phone: '',
    },
    specialRequests: '',
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [calculatedPrice, setCalculatedPrice] = useState({
    basePrice: basePrice,
    serviceFee: basePrice * 0.1,
    tax: basePrice * 0.15,
    total: basePrice * 1.25,
  });

  useEffect(() => {
    // Calculate price based on guests
    const totalGuests = formData.guests.adults + formData.guests.children;
    const newBasePrice = basePrice * totalGuests;
    const serviceFee = newBasePrice * 0.1;
    const tax = newBasePrice * 0.15;
    
    setCalculatedPrice({
      basePrice: newBasePrice,
      serviceFee,
      tax,
      total: newBasePrice + serviceFee + tax,
    });
  }, [formData.guests, basePrice]);

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleGuestChange = (guests: GuestCount) => {
    setFormData(prev => ({ ...prev, guests }));
  };

  const handleTimeSlotChange = (timeSlotId: string) => {
    setFormData(prev => ({ ...prev, timeSlotId }));
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BookingFormData] as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!formData.contactInfo.fullName.trim()) {
      newErrors['contactInfo.fullName'] = 'Full name is required';
    }

    if (!formData.contactInfo.email.trim()) {
      newErrors['contactInfo.email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
      newErrors['contactInfo.email'] = 'Please enter a valid email';
    }

    if (!formData.contactInfo.phone.trim()) {
      newErrors['contactInfo.phone'] = 'Phone number is required';
    }

    const totalGuests = formData.guests.adults + formData.guests.children + formData.guests.infants;
    if (totalGuests > maxGuests) {
      newErrors['guests'] = `Maximum ${maxGuests} guests allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await onSubmit(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  const renderPriceBreakdown = () => (
    <View style={styles.priceSection}>
      <Text style={styles.sectionTitle}>Price Breakdown</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>
          {basePrice} × {formData.guests.adults + formData.guests.children} guests
        </Text>
        <Text style={styles.priceValue}>
          {formatCurrency(calculatedPrice.basePrice, 'ETB')}
        </Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Service fee</Text>
        <Text style={styles.priceValue}>
          {formatCurrency(calculatedPrice.serviceFee, 'ETB')}
        </Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tax</Text>
        <Text style={styles.priceValue}>
          {formatCurrency(calculatedPrice.tax, 'ETB')}
        </Text>
      </View>
      
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(calculatedPrice.total, 'ETB')}
        </Text>
      </View>
    </View>
  );

  const renderBookingDetails = () => (
    <View style={styles.detailsSection}>
      <Text style={styles.sectionTitle}>Booking Details</Text>
      
      <View style={styles.detailRow}>
        <Ionicons name="calendar" size={20} color={colors.textSecondary} />
        <Text style={styles.detailText}>
          {formatDate(formData.date, 'medium')}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="people" size={20} color={colors.textSecondary} />
        <Text style={styles.detailText}>
          {formData.guests.adults} adult{formData.guests.adults !== 1 ? 's' : ''}
          {formData.guests.children > 0 && `, ${formData.guests.children} child${formData.guests.children !== 1 ? 'ren' : ''}`}
          {formData.guests.infants > 0 && `, ${formData.guests.infants} infant${formData.guests.infants !== 1 ? 's' : ''}`}
        </Text>
      </View>
      
      {eventTitle && (
        <View style={styles.detailRow}>
          <Ionicons name="ticket" size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{eventTitle}</Text>
        </View>
      )}
      
      {placeName && (
        <View style={styles.detailRow}>
          <Ionicons name="location" size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{placeName}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return <Loading message="Processing booking..." />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Your Booking</Text>
          <Text style={styles.headerSubtitle}>
            Please fill in the details below
          </Text>
        </View>

        {/* Booking Details */}
        {renderBookingDetails()}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <DatePicker
            selectedDate={formData.date}
            onDateChange={handleDateChange}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </View>

        {/* Time Slot Selection */}
        {eventId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <TimeSlotPicker
              eventId={eventId}
              selectedDate={formData.date}
              onSlotSelect={handleTimeSlotChange}
            />
          </View>
        )}

        {/* Guest Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>
          <GuestCounter
            guests={formData.guests}
            onChange={handleGuestChange}
            maxGuests={maxGuests}
            error={errors.guests}
          />
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <Input
            label="Full Name"
            value={formData.contactInfo.fullName}
            onChangeText={(value) => handleInputChange('contactInfo.fullName', value)}
            placeholder="Enter your full name"
            error={errors['contactInfo.fullName']}
            leftIcon={<Ionicons name="person" size={20} color={colors.textSecondary} />}
            style={styles.input}
          />
          
          <Input
            label="Email Address"
            value={formData.contactInfo.email}
            onChangeText={(value) => handleInputChange('contactInfo.email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors['contactInfo.email']}
            leftIcon={<Ionicons name="mail" size={20} color={colors.textSecondary} />}
            style={styles.input}
          />
          
          <Input
            label="Phone Number"
            value={formData.contactInfo.phone}
            onChangeText={(value) => handleInputChange('contactInfo.phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors['contactInfo.phone']}
            leftIcon={<Ionicons name="call" size={20} color={colors.textSecondary} />}
            style={styles.input}
          />
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <Input
            value={formData.specialRequests}
            onChangeText={(value) => handleInputChange('specialRequests', value)}
            placeholder="Any special requirements or requests..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        {/* Price Breakdown */}
        {renderPriceBreakdown()}

        {/* Terms & Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By completing this booking, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Cancellation Policy</Text>.
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.actionButton}
          />
          <Button
            title={`Book Now - ${formatCurrency(calculatedPrice.total, 'ETB')}`}
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    opacity: 0.8,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priceSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  priceLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  termsText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});