import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { BookingForm } from '../components/BookingForm';
import { useBooking } from '../hooks/useBooking';
import { useBookingAnalytics } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { BookingFormData } from '../types/booking.types';
import * as Haptics from 'expo-haptics';

type BookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Booking'>;
type BookingScreenRouteProp = RouteProp<RootStackParamList, 'Booking'>;

export const BookingScreen: React.FC = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const route = useRoute<BookingScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { eventId, placeId } = route.params;
  
  const { createBooking } = useBooking();
  const { recordBookingAction } = useBookingAnalytics();

  const [eventDetails, setEventDetails] = useState<any>(null);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, fetch event/place details from API
      await new Promise(resolve => setTimeout(resolve, 500));

      if (eventId) {
        // Mock event data
        setEventDetails({
          id: eventId,
          title: 'Traditional Coffee Ceremony',
          description: 'Experience the authentic Ethiopian coffee ritual',
          price: 500,
          maxGuests: 20,
          date: new Date().toISOString(),
          place: {
            name: 'Addis Ababa Cultural Center',
            address: 'Bole Road, Addis Ababa',
          },
        });
      } else if (placeId) {
        // Mock place data
        setPlaceDetails({
          id: placeId,
          name: 'Lucy Museum',
          description: 'Home of the famous fossil Lucy',
          price: 300,
          maxGuests: 50,
          address: 'National Museum, Addis Ababa',
        });
      }
    } catch (err) {
      setError('Failed to load details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: BookingFormData) => {
    try {
      const confirmation = await createBooking(data);
      
      if (confirmation) {
        recordBookingAction(confirmation.bookingId, 'create');
        
        Alert.alert(
          'Booking Confirmed!',
          `Your booking has been confirmed. Confirmation #: ${confirmation.confirmationNumber}`,
          [
            {
              text: 'View Booking',
              onPress: () => navigation.navigate('BookingConfirmation', { 
                bookingId: confirmation.bookingId 
              }),
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        {
          text: 'Continue Booking',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Button
        title="Cancel"
        variant="ghost"
        onPress={handleCancel}
        leftIcon={<Ionicons name="arrow-back" size={20} />}
        style={styles.backButton}
      />
      
      <Text style={styles.headerTitle}>New Booking</Text>
      
      <View style={styles.headerRight} />
    </View>
  );

  if (isLoading) {
    return <Loading message="Loading booking details..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadDetails}
      />
    );
  }

  const title = eventDetails?.title || placeDetails?.name;
  const basePrice = eventDetails?.price || placeDetails?.price || 0;
  const maxGuests = eventDetails?.maxGuests || placeDetails?.maxGuests || 10;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <BookingForm
        eventId={eventId}
        placeId={placeId}
        eventTitle={eventDetails?.title}
        placeName={placeDetails?.name}
        basePrice={basePrice}
        maxGuests={maxGuests}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 80,
  },
});