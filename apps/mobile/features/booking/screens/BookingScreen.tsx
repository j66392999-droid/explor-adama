import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { BookingForm } from '../components/BookingForm';
import { useBooking } from '../hooks/useBooking';
import { useDiscovery } from '../../discovery/hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type BookingScreenProps = {
  route: RouteProp<{ 
    params: { 
      eventId: string;
      placeId?: string;
      placeName?: string;
    } 
  }, 'params'>;
  navigation: any;
};

export const BookingScreen: React.FC<BookingScreenProps> = ({
  route,
  navigation,
}) => {
  const { eventId, placeId, placeName } = route.params;
  const { colors } = useTheme();
  
  const [bookingData, setBookingData] = useState<any>(null);
  
  const {
    selectedEvent: eventDetail,
    isLoading: eventLoading,
    error: eventError,
    getEventDetail,
  } = useDiscovery();

  const {
    createBooking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useBooking();

  useEffect(() => {
    getEventDetail(eventId);
  }, [eventId]);

  const handleSubmit = async (formData: any) => {
    setBookingData(formData);
    
    try {
      const booking = await createBooking(formData);
      
      navigation.navigate('BookingConfirmation', {
        bookingId: booking.id,
        eventId: eventId,
      });
    } catch (error: any) {
      Alert.alert('Booking Failed', error || 'Something went wrong');
    }
  };

  if (eventLoading) {
    return <Loading />;
  }

  if (eventError || !eventDetail) {
    return (
      <ErrorState
        message="Failed to load event details"
        onRetry={() => getEventDetail(eventId)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="large">Book Tickets</Text>
          <Text style={styles.subtitle}>
            Complete your booking for {eventDetail.title}
          </Text>
        </View>

        <BookingForm
          event={eventDetail as any}
          onSubmit={handleSubmit}
          isLoading={bookingLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
});