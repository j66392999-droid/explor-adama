import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { QRCodeDisplay } from '../../tickets/components/QRCodeDisplay';
import { useBooking } from '../hooks/useBooking';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { formatDate, formatTime, formatCurrency } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingConfirmation'>;
type BookingConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'BookingConfirmation'>;

export const BookingConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<BookingConfirmationScreenNavigationProp>();
  const route = useRoute<BookingConfirmationScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);

  const { bookingId } = route.params;
  
  const { loadBooking, loadTickets, addToCalendar, setReminder } = useBooking();

  const [booking, setBooking] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, fetch booking and tickets from API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock booking data - UPDATED TO SHOW PENDING PAYMENT STATUS
      const mockBooking = {
        id: bookingId,
        confirmationNumber: 'BK' + Date.now().toString().slice(-8),
        event: {
          title: 'Traditional Coffee Ceremony',
          date: new Date(Date.now() + 86400000 * 3).toISOString(),
          startTime: '14:00',
          endTime: '16:00',
          place: {
            name: 'Addis Ababa Cultural Center',
            address: 'Bole Road, Addis Ababa',
          },
        },
        guests: {
          adults: 2,
          children: 1,
          infants: 0,
        },
        subtotal: 1500,
        tax: 225,
        fees: 150,
        total: 1875,
        status: 'PENDING', // Changed from CONFIRMED to PENDING for payment demo
        paymentStatus: 'PENDING', // Added payment status
        createdAt: new Date().toISOString(),
        notes: 'Please arrive 15 minutes before start time',
        // Added payment information
        payment: {
          id: 'payment_' + Date.now(),
          status: 'PENDING',
          provider: 'CHAPA'
        }
      };

      // Mock tickets
      const mockTickets = [
        {
          id: 'ticket_1',
          qrToken: 'ticket_' + Date.now(),
          seat: 'A12',
          status: 'PENDING',
        },
        {
          id: 'ticket_2',
          qrToken: 'ticket_' + (Date.now() + 1),
          seat: 'A13',
          status: 'PENDING',
        },
        {
          id: 'ticket_3',
          qrToken: 'ticket_' + (Date.now() + 2),
          seat: 'A14',
          status: 'PENDING',
        },
      ];

      setBooking(mockBooking);
      setTickets(mockTickets);
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== PAYMENT HANDLERS ====================
  
  const handleProceedToPayment = () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to proceed with payment',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to Payment screen
    navigation.navigate('Payment', {
      bookingId: booking.id,
      amount: booking.total,
      eventTitle: booking.event?.title || booking.place?.name,
      bookingDetails: booking
    });
  };

  const handlePaymentStatusCheck = async () => {
    try {
      setIsLoading(true);
      // In real app, call API to check payment status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock payment check
      Alert.alert(
        'Payment Status',
        'Your payment is still pending. Please complete the payment to confirm your booking.',
        [
          { text: 'Check Payment', onPress: handleProceedToPayment },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check payment status');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== EXISTING HANDLERS ====================

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I booked ${booking.event.title} on ${formatDate(booking.event.date)}! Confirmation #: ${booking.confirmationNumber}`,
        url: 'app://booking/' + bookingId,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to share booking', error);
    }
  };

  const handleAddToCalendar = async () => {
    if (booking.status !== 'CONFIRMED') {
      Alert.alert('Cannot Add to Calendar', 'Please complete payment first to confirm your booking.');
      return;
    }
    
    const success = await addToCalendar(booking);
    if (success) {
      Alert.alert('Success', 'Booking added to your calendar');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Error', 'Failed to add to calendar. Please check your calendar permissions.');
    }
  };

  const handleSetReminder = async () => {
    if (booking.status !== 'CONFIRMED') {
      Alert.alert('Cannot Set Reminder', 'Please complete payment first to confirm your booking.');
      return;
    }
    
    const success = await setReminder(bookingId, 24); // 24 hours before
    if (success) {
      Alert.alert('Success', 'Reminder set for 24 hours before the event');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Error', 'Failed to set reminder. Please check your notification permissions.');
    }
  };

  const handlePrint = async () => {
    if (booking.status !== 'CONFIRMED') {
      Alert.alert('Cannot Print Ticket', 'Please complete payment first to confirm your booking.');
      return;
    }
    
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
              .qr-code { text-align: center; margin: 20px 0; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Booking Confirmation</div>
              <div>Confirmation #: ${booking.confirmationNumber}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Event Details</div>
              <div class="row"><span>Event:</span><span>${booking.event.title}</span></div>
              <div class="row"><span>Date:</span><span>${formatDate(booking.event.date, 'long')}</span></div>
              <div class="row"><span>Time:</span><span>${formatTime(booking.event.startTime)} - ${formatTime(booking.event.endTime)}</span></div>
              <div class="row"><span>Location:</span><span>${booking.event.place.name}</span></div>
              <div class="row"><span>Address:</span><span>${booking.event.place.address}</span></div>
            </div>
            
            <div class="section">
              <div class="section-title">Booking Details</div>
              <div class="row"><span>Guests:</span><span>${booking.guests.adults} adults, ${booking.guests.children} children</span></div>
              <div class="row"><span>Confirmation Date:</span><span>${formatDate(booking.createdAt, 'long')}</span></div>
              <div class="row"><span>Status:</span><span>${booking.status}</span></div>
            </div>
            
            <div class="section">
              <div class="section-title">Price Breakdown</div>
              <div class="row"><span>Subtotal:</span><span>ETB ${booking.subtotal.toFixed(2)}</span></div>
              <div class="row"><span>Tax:</span><span>ETB ${booking.tax.toFixed(2)}</span></div>
              <div class="row"><span>Service Fee:</span><span>ETB ${booking.fees.toFixed(2)}</span></div>
              <div class="total">Total: ETB ${booking.total.toFixed(2)}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Tickets (${tickets.length})</div>
              ${tickets.map((ticket, index) => `
                <div class="row">
                  <span>Ticket ${index + 1}:</span>
                  <span>Seat ${ticket.seat}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="qr-code">
              <!-- QR Code would be generated here -->
              <div>Scan QR code at entrance</div>
            </div>
            
            <div class="footer">
              <div>Thank you for your booking!</div>
              <div>For questions, contact support@exploradama.com</div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Failed to print booking', error);
      Alert.alert('Error', 'Failed to generate printable version');
    }
  };

  const handleViewMap = () => {
    const address = encodeURIComponent(booking.event.place.address);
    const url = `https://maps.google.com/?q=${address}`;
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Unable to open maps app');
    });
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Button
        title="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
        leftIcon={<Ionicons name="arrow-back" size={20} />}
        style={styles.backButton}
      />
      
      <Text style={styles.headerTitle}>Booking Confirmation</Text>
      
      <TouchableOpacity onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderStatusBadge = () => {
    const isConfirmed = booking.status === 'CONFIRMED';
    const isPending = booking.status === 'PENDING';
    
    let backgroundColor = '#FF9500'; // Orange for pending
    let statusText = 'Pending Payment';
    let icon: React.ComponentProps<typeof Ionicons>['name'] = 'time';
    
    if (isConfirmed) {
      backgroundColor = '#34C759'; // Green for confirmed
      statusText = 'Confirmed';
      icon = 'checkmark-circle' as const;
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Ionicons name={icon} size={16} color="white" />
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };

  const renderConfirmationCard = () => (
    <View style={[styles.confirmationCard, { backgroundColor: colors.surface }]}>
      <View style={styles.confirmationHeader}>
        {renderStatusBadge()}
        
        <Text style={styles.confirmationNumber}>
          #{booking.confirmationNumber}
        </Text>
      </View>
      
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{booking.event.title}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              {formatDate(booking.event.date, 'medium')}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              {formatTime(booking.event.startTime)} - {formatTime(booking.event.endTime)}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.eventDetailText}>
              {booking.event.place.name}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.guestInfo}>
        <Text style={styles.sectionTitle}>Guests</Text>
        <Text style={styles.guestCount}>
          {booking.guests.adults} adult{booking.guests.adults !== 1 ? 's' : ''}
          {booking.guests.children > 0 && `, ${booking.guests.children} child${booking.guests.children !== 1 ? 'ren' : ''}`}
          {booking.guests.infants > 0 && `, ${booking.guests.infants} infant${booking.guests.infants !== 1 ? 's' : ''}`}
        </Text>
      </View>
    </View>
  );

  const renderPaymentSection = () => {
    const isConfirmed = booking.status === 'CONFIRMED';
    const isPending = booking.status === 'PENDING';
    
    if (isConfirmed) {
      return (
        <View style={[styles.paymentCard, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
          <View style={styles.paymentHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.paymentTitle}>Payment Completed</Text>
          </View>
          <Text style={styles.paymentDescription}>
            Your payment of {formatCurrency(booking.total, 'ETB')} has been processed successfully.
          </Text>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentDetail}>
              <Text style={styles.paymentDetailLabel}>Payment ID: </Text>
              {booking.payment?.id?.slice(-8) || 'N/A'}
            </Text>
            <Text style={styles.paymentDetail}>
              <Text style={styles.paymentDetailLabel}>Method: </Text>
              {booking.payment?.provider || 'CHAPA'}
            </Text>
          </View>
        </View>
      );
    }
    
    if (isPending) {
      return (
        <View style={[styles.paymentCard, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
          <View style={styles.paymentHeader}>
            <Ionicons name="alert-circle" size={24} color="#FF9500" />
            <Text style={styles.paymentTitle}>Payment Required</Text>
          </View>
          <Text style={styles.paymentDescription}>
            Complete payment to confirm your booking. Total amount: {formatCurrency(booking.total, 'ETB')}
          </Text>
          
          <View style={styles.paymentActions}>
            <Button
              title={`Pay ${formatCurrency(booking.total, 'ETB')}`}
              onPress={handleProceedToPayment}
              style={styles.payButton}
              leftIcon={<Ionicons name="lock-closed" size={20} color="white" />}
            />
            
            <Button
              title="Check Payment Status"
              variant="outline"
              onPress={handlePaymentStatusCheck}
              style={styles.checkButton}
              leftIcon={<Ionicons name="refresh" size={20} />}
            />
          </View>
          
          <Text style={styles.paymentNote}>
            ⚡ Payment must be completed within 24 hours to reserve your spot
          </Text>
        </View>
      );
    }
    
    return null;
  };

  const renderQRCode = () => {
    // Only show QR code if booking is confirmed
    if (booking.status !== 'CONFIRMED') {
      return null;
    }
    
    return (
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>Your Ticket</Text>
        <Text style={styles.qrDescription}>
          Show this QR code at the entrance
        </Text>
        
        <QRCodeDisplay
          qrToken={tickets[0]?.qrToken || bookingId}
          size={200}
        />
        
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketText}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} • Seats:{' '}
            {tickets.map(t => t.seat).join(', ')}
          </Text>
        </View>
      </View>
    );
  };

  const renderPriceBreakdown = () => (
    <View style={styles.priceSection}>
      <Text style={styles.sectionTitle}>Price Breakdown</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Subtotal</Text>
        <Text style={styles.priceValue}>
          {formatCurrency(booking.subtotal, 'ETB')}
        </Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Tax</Text>
        <Text style={styles.priceValue}>
          {formatCurrency(booking.tax, 'ETB')}
        </Text>
      </View>
      
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Service Fee</Text>
        <Text style={styles.priceValue}>
          {formatCurrency(booking.fees, 'ETB')}
        </Text>
      </View>
      
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total {booking.status === 'PENDING' ? 'Due' : 'Paid'}</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(booking.total, 'ETB')}
        </Text>
      </View>
    </View>
  );

  const renderInstructions = () => {
    if (booking.status !== 'CONFIRMED') {
      return (
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          
          <View style={styles.instruction}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.instructionTitle}>Complete Payment</Text>
              <Text style={styles.instructionText}>
                Click the "Pay Now" button above to complete your payment via Chapa
              </Text>
            </View>
          </View>
          
          <View style={styles.instruction}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.instructionTitle}>Receive Confirmation</Text>
              <Text style={styles.instructionText}>
                You'll receive instant confirmation once payment is successful
              </Text>
            </View>
          </View>
          
          <View style={styles.instruction}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.instructionTitle}>Access Tickets</Text>
              <Text style={styles.instructionText}>
                Your tickets will be available in the app and sent to your email
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentMethodsInfo}>
            <Text style={styles.paymentMethodsTitle}>Accepted Payment Methods:</Text>
            <View style={styles.paymentMethodsList}>
              <View style={styles.paymentMethod}>
                <Ionicons name="card" size={16} color={colors.text} />
                <Text style={styles.paymentMethodText}>Credit/Debit Cards</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Ionicons name="phone-portrait" size={16} color={colors.text} />
                <Text style={styles.paymentMethodText}>Mobile Banking</Text>
              </View>
              <View style={styles.paymentMethod}>
                <Ionicons name="cash" size={16} color={colors.text} />
                <Text style={styles.paymentMethodText}>Telebirr & CBE Birr</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>Important Information</Text>
        
        <View style={styles.instruction}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.instructionText}>
            Please arrive 15 minutes before the start time
          </Text>
        </View>
        
        <View style={styles.instruction}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.instructionText}>
            Bring a valid ID for verification
          </Text>
        </View>
        
        <View style={styles.instruction}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.instructionText}>
            Parking is available at the venue
          </Text>
        </View>
        
        {booking.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Additional Notes:</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => {
    // Only show actions if booking is confirmed
    if (booking.status !== 'CONFIRMED') {
      return null;
    }
    
    return (
      <View style={styles.actions}>
        <Button
          title="Add to Calendar"
          variant="outline"
          onPress={handleAddToCalendar}
          leftIcon={<Ionicons name="calendar" size={20} />}
          style={styles.actionButton}
        />
        
        <Button
          title="Set Reminder"
          variant="outline"
          onPress={handleSetReminder}
          leftIcon={<Ionicons name="notifications" size={20} />}
          style={styles.actionButton}
        />
        
        <Button
          title="View on Map"
          variant="outline"
          onPress={handleViewMap}
          leftIcon={<Ionicons name="map" size={20} />}
          style={styles.actionButton}
        />
        
        <Button
          title="Print Ticket"
          variant="outline"
          onPress={handlePrint}
          leftIcon={<Ionicons name="print" size={20} />}
          style={styles.actionButton}
        />
      </View>
    );
  };

  if (isLoading) {
    return <Loading message="Loading booking confirmation..." />;
  }

  if (error || !booking) {
    return (
      <ErrorState
        message={error || 'Booking not found'}
        onRetry={loadBookingData}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderConfirmationCard()}
        {renderPaymentSection()}
        {renderQRCode()}
        {renderPriceBreakdown()}
        {renderInstructions()}
        {renderActions()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact support@exploradama.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==================== STYLES ====================

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
  confirmationCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationNumber: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  eventInfo: {
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 28,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 16,
    opacity: 0.7,
  },
  guestInfo: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  guestCount: {
    fontSize: 16,
    opacity: 0.8,
  },
  // Payment Card Styles
  paymentCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  paymentDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 22,
  },
  paymentDetails: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  paymentDetailLabel: {
    fontWeight: '600',
    opacity: 0.7,
  },
  paymentActions: {
    gap: 12,
    marginBottom: 12,
  },
  payButton: {
    width: '100%',
  },
  checkButton: {
    width: '100%',
  },
  paymentNote: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  qrSection: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrDescription: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
  },
  ticketInfo: {
    marginTop: 12,
  },
  ticketText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  priceSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#007AFF',
  },
  instructionsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  paymentMethodsInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentMethodsList: {
    gap: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    opacity: 0.8,
  },
  notes: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,122,255,0.05)',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#007AFF',
  },
  notesText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});