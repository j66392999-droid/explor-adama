// features/payments/screens/PaymentSuccessScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

type PaymentSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PaymentSuccess'
>;
type PaymentSuccessScreenRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

export const PaymentSuccessScreen: React.FC = () => {
  const navigation = useNavigation<PaymentSuccessScreenNavigationProp>();
  const route = useRoute<PaymentSuccessScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { bookingId, amount, eventTitle, txRef } = route.params as any;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    loadPaymentAndBookingDetails();
  }, []);

  const loadPaymentAndBookingDetails = async () => {
    try {
      setIsLoading(true);
      
      // In real app, call your backend APIs:
      // 1. Verify payment status
      // 2. Get updated booking details
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API calls
      const mockPayment = {
        id: 'payment_' + Date.now(),
        status: 'SUCCESS',
        provider: 'CHAPA',
        providerTransactionId: txRef || 'chapa_tx_' + Date.now(),
        amount: amount,
        currency: 'ETB',
        createdAt: new Date().toISOString(),
      };

      const mockBooking = {
        id: bookingId,
        confirmationNumber: 'BK' + Date.now().toString().slice(-8),
        status: 'CONFIRMED',
        event: {
          title: eventTitle || 'Traditional Coffee Ceremony',
          date: new Date(Date.now() + 86400000 * 3).toISOString(),
          startTime: '14:00',
          endTime: '16:00',
          place: {
            name: 'Addis Ababa Cultural Center',
            address: 'Bole Road, Addis Ababa',
          },
        },
        total: amount,
        paymentId: mockPayment.id,
      };

      setPayment(mockPayment);
      setBooking(mockBooking);
      
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `✅ Payment successful! I just paid ${formatCurrency(amount, 'ETB')} for ${eventTitle} via ExplorAdama!`,
        url: 'app://booking/' + bookingId,
      });
    } catch (error) {
      console.error('Failed to share payment', error);
    }
  };

  const handleViewBooking = () => {
    navigation.navigate('BookingConfirmation', { 
      bookingId: booking.id 
    });
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleViewTickets = () => {
    // Navigate to tickets screen
    navigation.navigate('Tickets');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@exploradama.com').catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Button
        title="Close"
        variant="ghost"
        onPress={handleGoHome}
        leftIcon={<Ionicons name="close" size={20} />}
        style={styles.closeButton}
      />
      
      <Text style={styles.headerTitle}>Payment Complete</Text>
      
      <TouchableOpacity onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSuccessAnimation = () => (
    <View style={styles.animationContainer}>
      <LottieView
        source={require('../../../assets/animations/success.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );

  const renderSuccessMessage = () => (
    <View style={styles.successCard}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={64} color="#34C759" />
      </View>
      
      <Text style={styles.successTitle}>Payment Successful!</Text>
      <Text style={styles.successAmount}>
        {formatCurrency(amount, 'ETB')}
      </Text>
      <Text style={styles.successMessage}>
        Your booking for "{eventTitle}" has been confirmed.
      </Text>
      
      <View style={styles.confirmationBadge}>
        <Text style={styles.confirmationLabel}>Confirmation #</Text>
        <Text style={styles.confirmationNumber}>
          {booking?.confirmationNumber || 'BK' + Date.now().toString().slice(-8)}
        </Text>
      </View>
    </View>
  );

  const renderPaymentDetails = () => (
    <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
      <Text style={styles.detailsTitle}>Payment Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Transaction ID:</Text>
        <Text style={styles.detailValue}>
          {payment?.providerTransactionId?.slice(-12) || 'N/A'}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Payment Method:</Text>
        <View style={styles.paymentMethodBadge}>
          <Ionicons name="card" size={14} color={colors.primary} />
          <Text style={styles.paymentMethodText}>Chapa</Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date & Time:</Text>
        <Text style={styles.detailValue}>
          {formatDate(payment?.createdAt || new Date().toISOString(), 'long')}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#34C759' }]}>
          <Text style={styles.statusText}>SUCCESS</Text>
        </View>
      </View>
    </View>
  );

  const renderNextSteps = () => (
    <View style={styles.nextStepsCard}>
      <Text style={styles.nextStepsTitle}>What Happens Next?</Text>
      
      <View style={styles.step}>
        <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="mail" size={18} color="white" />
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Email Confirmation</Text>
          <Text style={styles.stepDescription}>
            You'll receive a confirmation email with all details
          </Text>
        </View>
      </View>
      
      <View style={styles.step}>
        <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="ticket" size={18} color="white" />
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Ticket Delivery</Text>
          <Text style={styles.stepDescription}>
            Tickets will be available in the app 24 hours before the event
          </Text>
        </View>
      </View>
      
      <View style={styles.step}>
        <View style={[styles.stepIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="notifications" size={18} color="white" />
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Event Reminder</Text>
          <Text style={styles.stepDescription}>
            We'll send you a reminder 24 hours before your event
          </Text>
        </View>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <Button
        title="View Booking Details"
        onPress={handleViewBooking}
        style={styles.actionButton}
        leftIcon={<Ionicons name="calendar" size={20} />}
      />
      
      <Button
        title="View Tickets"
        variant="outline"
        onPress={handleViewTickets}
        style={styles.actionButton}
        leftIcon={<Ionicons name="ticket" size={20} />}
      />
      
      <Button
        title="Share Payment"
        variant="outline"
        onPress={handleShare}
        style={styles.actionButton}
        leftIcon={<Ionicons name="share-outline" size={20} />}
      />
      
      <Button
        title="Go to Home"
        variant="ghost"
        onPress={handleGoHome}
        style={styles.actionButton}
        leftIcon={<Ionicons name="home" size={20} />}
      />
    </View>
  );

  const renderSupport = () => (
    <View style={styles.supportCard}>
      <Ionicons name="help-circle" size={24} color={colors.primary} />
      <Text style={styles.supportTitle}>Need Help?</Text>
      <Text style={styles.supportText}>
        If you have any questions about your payment or booking, our support team is here to help.
      </Text>
      <Button
        title="Contact Support"
        variant="outline"
        size="small"
        onPress={handleContactSupport}
        leftIcon={<Ionicons name="chatbubble" size={16} />}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <Loading message="Verifying payment..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ErrorState
          message={error}
          onRetry={loadPaymentAndBookingDetails}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderSuccessAnimation()}
        {renderSuccessMessage()}
        {renderPaymentDetails()}
        {renderNextSteps()}
        {renderActions()}
        {renderSupport()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for using ExplorAdama! 🎉
          </Text>
        </View>
      </ScrollView>
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
  closeButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  animation: {
    width: 150,
    height: 150,
  },
  successCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  confirmationBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  confirmationNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 16,
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  nextStepsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(0,122,255,0.05)',
    borderRadius: 16,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  actions: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  supportCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});