import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useBooking } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';

type BookingConfirmationScreenProps = {
  route: RouteProp<{ 
    params: { 
      bookingId: string;
      eventId: string;
    } 
  }, 'params'>;
  navigation: any;
};

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const { bookingId, eventId } = route.params;
  const { colors } = useTheme();
  
  const {
    bookingDetail,
    isLoading,
    error,
    getBookingDetail,
  } = useBooking();

  const { onScroll, scrollEventThrottle } = useHideOnScroll();

  useEffect(() => {
    getBookingDetail(bookingId);
  }, [bookingId]);

  const handleViewTickets = () => {
    navigation.navigate('Tickets');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleShare = () => {
    // Implement share functionality
    Alert.alert('Share', 'Share functionality would go here');
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !bookingDetail) {
    return (
      <ErrorState
        message="Failed to load booking details"
        onRetry={() => getBookingDetail(bookingId)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Image
            source={require('../../../assets/images/icons/success.png')}
            style={styles.successImage}
          />
        </View>

        {/* Title */}
        <Text variant="large" style={styles.title}>
          Booking Confirmed!
        </Text>
        
        <Text style={styles.subtitle}>
          Your tickets have been reserved successfully
        </Text>

        {/* Booking Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          <Text variant="large" style={styles.detailsTitle}>
            Booking Details
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event:</Text>
            <Text style={styles.detailValue}>
              {bookingDetail.event.title}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(bookingDetail.event.date).toLocaleDateString()}
            </Text>
          </View>
          
          {bookingDetail.event.startTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>
                {new Date(bookingDetail.event.startTime).toLocaleTimeString()}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tickets:</Text>
            <Text style={styles.detailValue}>
              {bookingDetail.quantity} {bookingDetail.quantity === 1 ? 'ticket' : 'tickets'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={[styles.detailValue, styles.total]}>
              ${bookingDetail.total.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.bookingId}>
              {bookingDetail.id}
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps}>
          <Text variant="large" style={styles.nextStepsTitle}>
            What's Next?
          </Text>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Find Your Tickets</Text>
              <Text style={styles.stepDescription}>
                Your tickets are available in the "My Tickets" section
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Save the Date</Text>
              <Text style={styles.stepDescription}>
                Add the event to your calendar so you don't forget
              </Text>
            </View>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Enjoy the Event</Text>
              <Text style={styles.stepDescription}>
                Show your QR code at the entrance
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="View My Tickets"
          onPress={handleViewTickets}
          fullWidth
          style={styles.primaryButton}
        />
        
        <View style={styles.secondaryActions}>
          <Button
            title="Share"
            variant="outline"
            onPress={handleShare}
            style={styles.secondaryButton}
          />
          
          <Button
            title="Back to Home"
            variant="ghost"
            onPress={handleGoHome}
            style={styles.secondaryButton}
          />
        </View>
      </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successImage: {
    width: 80,
    height: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    fontSize: 16,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    opacity: 0.7,
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bookingId: {
    fontSize: 12,
    opacity: 0.7,
    fontFamily: 'monospace',
  },
  nextSteps: {
    marginBottom: 32,
  },
  nextStepsTitle: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    opacity: 0.7,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
});