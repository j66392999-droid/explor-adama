// features/tickets/screens/TicketDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { TicketActions } from '../components/TicketActions';
import { useTickets } from '../hooks/useTickets';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { TICKET_STATUSES, TicketStatus, Ticket } from '../types/tickets.types';
import { formatDate, formatTime, formatCurrency } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

type TicketDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TicketDetail'>;
type TicketDetailScreenRouteProp = RouteProp<RootStackParamList, 'TicketDetail'>;

export const TicketDetailScreen: React.FC = () => {
  const navigation = useNavigation<TicketDetailScreenNavigationProp>();
  const route = useRoute<TicketDetailScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { ticketId } = route.params;
  const { loadTicket, markTicketAsUsed, isLoading } = useTickets();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrImageUri, setQrImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      const ticketData = await loadTicket(ticketId);
      if (ticketData) {
        setTicket(ticketData);
        
        // In real app, fetch QR code from backend
        // For now, we'll use a mock
        if (ticketData.qrToken) {
          setQrImageUri(`data:image/png;base64,mock_qr_${ticketData.qrToken}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket');
    }
  };

  const handleAddToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow calendar access to add events.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendar = calendars.find(c => (c as any).allowsModifications) || calendars[0];
      
      if (!defaultCalendar || !defaultCalendar.id) {
        throw new Error('No calendar available');
      }

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Event: ${ticket!.event?.title}`,
        startDate: new Date(ticket!.event?.date || ticket!.issuedAt),
        endDate: new Date(ticket!.event?.date || ticket!.issuedAt),
        timeZone: 'UTC',
        notes: `Ticket ID: ${ticket!.id}\nSeat: ${ticket!.seat || 'General Admission'}`,
        location: ticket!.event?.place?.address || ticket!.event?.place?.name,
      });

      Alert.alert('Success', 'Event added to your calendar!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add to calendar');
    }
  };

  const handleSetReminder = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow notifications to set reminders.');
        return;
      }

      const eventDate = new Date(ticket!.event?.date || ticket!.issuedAt);
      const reminderDate = new Date(eventDate);
      reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming Event Reminder',
          body: `Your event "${ticket!.event?.title}" starts tomorrow!`,
          data: { ticketId: ticket!.id },
        },
        trigger: { date: reminderDate } as any,
      });

      Alert.alert('Success', 'Reminder set for 24 hours before the event!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to set reminder');
    }
  };

  const handleMarkAsUsed = async () => {
    Alert.alert(
      'Mark as Used',
      'Are you sure you want to mark this ticket as used? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Used',
          style: 'destructive',
          onPress: async () => {
            const updatedTicket = await markTicketAsUsed(ticket!.id);
            if (updatedTicket) {
              setTicket(updatedTicket);
              Alert.alert('Success', 'Ticket marked as used');
            }
          },
        },
      ]
    );
  };

  const handleViewEvent = () => {
    if (ticket?.event?.id) {
      navigation.navigate('EventDetail', { eventId: ticket!.event!.id });
    } else {
      Alert.alert('Info', 'Event details not available');
    }
  };

  const handleViewVenue = () => {
    if (ticket?.event?.place?.address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(ticket!.event!.place!.address)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open maps');
      });
    } else {
      Alert.alert('Info', 'Venue address not available');
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Button
        title="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
        leftIcon={<Ionicons name="arrow-back" size={20} />}
        style={styles.backButton}
      />
      
      <Text style={styles.headerTitle}>Ticket Details</Text>
      
      <TouchableOpacity
        onPress={handleViewEvent}
        disabled={!ticket?.event?.id}
      >
        <Ionicons 
          name="information-circle" 
          size={24} 
          color={ticket?.event?.id ? colors.primary : colors.textTertiary} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderStatusBadge = () => {
    const status = TICKET_STATUSES[(ticket!.status as TicketStatus)];

    return (
      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
        <Ionicons name={status.icon as any} size={16} color="white" />
        <Text style={styles.statusText}>{status.label}</Text>
      </View>
    );
  };

  const renderTicketInfo = () => (
    <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
      <View style={styles.infoHeader}>
        <Text style={styles.ticketNumber}>
          Ticket #{ticket!.id.slice(-12)}
        </Text>
        {renderStatusBadge()}
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Event Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="ticket" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Event</Text>
            <Text style={styles.infoValue}>
              {ticket?.event?.title || 'Unknown Event'}
            </Text>
          </View>
        </View>
        
        {ticket?.event?.date && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(ticket!.event!.date, 'long')}
              </Text>
            </View>
          </View>
        )}
        
        {ticket?.event?.startTime && (
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>
                {formatTime(ticket!.event!.startTime!)}
                {ticket!.event!.endTime && ` - ${formatTime(ticket!.event!.endTime!)}`}
              </Text>
            </View>
          </View>
        )}
        
        {ticket?.event?.place?.name && (
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={handleViewVenue}
          >
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>
                {ticket!.event!.place!.name}
              </Text>
              {ticket!.event!.place!.address && (
                <Text style={styles.infoAddress}>
                  {ticket!.event!.place!.address}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {ticket?.seat && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Seat</Text>
              <Text style={styles.infoValue}>
                {ticket!.seat}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Ticket Details</Text>
        
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Issued</Text>
            <Text style={styles.detailValue}>
              {formatDate(ticket!.issuedAt, 'short')}
            </Text>
          </View>
          
          {ticket?.usedAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Used</Text>
              <Text style={styles.detailValue}>
                {formatDate(ticket!.usedAt!, 'short')}
              </Text>
            </View>
          )}
          
          {ticket?.expiresAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>
                {formatDate(ticket!.expiresAt!, 'short')}
              </Text>
            </View>
          )}
          
          {ticket?.booking?.total && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(ticket!.booking!.total, 'ETB')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderQRCode = () => (
    <View style={styles.qrSection}>
      <Text style={styles.sectionTitle}>Your QR Code</Text>
      <Text style={styles.qrDescription}>
        Present this code at the entrance for scanning
      </Text>
      
      <QRCodeDisplay
        ticketId={ticket!.id}
        qrToken={ticket!.qrToken}
        qrCode={qrImageUri || undefined}
        size={250}
        showLabel={true}
      />
      
      {ticket?.status === 'CONFIRMED' && (
        <Button
          title="Mark as Used"
          variant="outline"
          onPress={handleMarkAsUsed}
          style={styles.markUsedButton}
          leftIcon={<Ionicons name="checkmark-done" size={20} />}
        />
      )}
    </View>
  );

  const renderInstructions = () => (
    <View style={styles.instructionsSection}>
      <Text style={styles.sectionTitle}>Important Instructions</Text>
      
      <View style={styles.instruction}>
        <Ionicons name="qr-code" size={20} color={colors.primary} />
        <Text style={styles.instructionText}>
          Present QR code at entrance for scanning
        </Text>
      </View>
      
      <View style={styles.instruction}>
        <Ionicons name="card" size={20} color={colors.primary} />
        <Text style={styles.instructionText}>
          Bring a valid ID matching ticket details
        </Text>
      </View>
      
      <View style={styles.instruction}>
        <Ionicons name="time" size={20} color={colors.primary} />
        <Text style={styles.instructionText}>
          Arrive 15-30 minutes before event start
        </Text>
      </View>
      
      <View style={styles.instruction}>
        <Ionicons name="warning" size={20} color={colors.warning} />
        <Text style={styles.instructionText}>
          Tickets are non-transferable and non-refundable
        </Text>
      </View>
    </View>
  );

  if (isLoading && !ticket) {
    return <Loading message="Loading ticket details..." />;
  }

  if (error || !ticket) {
    return (
      <ErrorState
        message={error || 'Ticket not found'}
        onRetry={loadTicketDetails}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTicketInfo()}
        {renderQRCode()}
        
        <TicketActions
          ticket={ticket}
          qrImageUri={qrImageUri || undefined}
          onAddToCalendar={handleAddToCalendar}
          onSetReminder={handleSetReminder}
        />
        
        {renderInstructions()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact support@exploradama.com
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
  backButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
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
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketNumber: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
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
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#007AFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoAddress: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
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
  markUsedButton: {
    marginTop: 16,
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
    marginBottom: 12,
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
    lineHeight: 20,
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