// features/tickets/components/TicketActions.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Ticket } from '../types/tickets.types';
import { formatDate } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface TicketActionsProps {
  ticket: Ticket;
  qrImageUri?: string;
  onAddToCalendar?: () => void;
  onSetReminder?: () => void;
}

export const TicketActions: React.FC<TicketActionsProps> = ({
  ticket,
  qrImageUri,
  onAddToCalendar,
  onSetReminder,
}) => {
  const { colors } = useTheme();
  const event = ticket.event;

  const handleShare = async () => {
    try {
      const eventName = event?.title || 'My Ticket';
      const eventDate = event?.date ? formatDate(event.date, 'medium') : '';
      const seatInfo = ticket.seat ? `Seat: ${ticket.seat}` : '';

      await Share.share({
        message: `Check out my ticket for ${eventName} on ${eventDate}! ${seatInfo} #ExplorAdama`,
        url: 'app://ticket/' + ticket.id,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to share ticket', error);
    }
  };

  const handleSaveToGallery = async () => {
    if (!qrImageUri) {
      Alert.alert('Error', 'QR code not available to save');
      return;
    }

    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save photos.');
        return;
      }

      // Create filename
      const fileName = `ticket_${ticket.id}_${Date.now()}.png`;
      const fsAny = FileSystem as any;
      const directory = fsAny.cacheDirectory ?? fsAny.documentDirectory ?? '';
      const fileUri = `${directory}${fileName}`;

      // Download QR code if it's a URL
      if (qrImageUri.startsWith('http')) {
        const downloadResult = await FileSystem.downloadAsync(qrImageUri, fileUri);
        qrImageUri = downloadResult.uri;
      }

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(qrImageUri);
      
      Alert.alert('Success', 'Ticket saved to your gallery!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to save ticket', error);
      Alert.alert('Error', 'Failed to save ticket to gallery');
    }
  };

  const handlePrint = async () => {
    try {
      const eventName = event?.title || 'Event Ticket';
      const eventDate = event?.date ? formatDate(event.date, 'long') : '';
      const eventTime = event?.startTime ? ` at ${event.startTime}` : '';
      const venue = event?.place?.name || '';
      
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .ticket-id { font-size: 14px; color: #666; margin-bottom: 20px; }
              .qr-container { text-align: center; margin: 30px 0; }
              .qr-code { max-width: 250px; margin: 0 auto; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #007AFF; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .label { color: #666; }
              .value { font-weight: 500; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
              .note { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${eventName}</div>
              <div class="ticket-id">Ticket #${ticket.id.slice(-12)}</div>
            </div>
            
            <div class="qr-container">
              <div class="qr-code">
                <!-- QR Code would be generated here -->
                <div style="border: 2px dashed #ccc; padding: 20px; text-align: center;">
                  <div style="font-size: 16px; margin-bottom: 10px;">Ticket QR Code</div>
                  <div style="font-size: 12px; color: #666;">Present at entrance</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Event Details</div>
              <div class="info-row">
                <span class="label">Date & Time:</span>
                <span class="value">${eventDate}${eventTime}</span>
              </div>
              ${venue ? `<div class="info-row">
                <span class="label">Venue:</span>
                <span class="value">${venue}</span>
              </div>` : ''}
              ${ticket.seat ? `<div class="info-row">
                <span class="label">Seat:</span>
                <span class="value">${ticket.seat}</span>
              </div>` : ''}
            </div>
            
            <div class="section">
              <div class="section-title">Ticket Information</div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">${ticket.status}</span>
              </div>
              <div class="info-row">
                <span class="label">Issued:</span>
                <span class="value">${formatDate(ticket.issuedAt, 'short')}</span>
              </div>
            </div>
            
            <div class="note">
              <strong>Important:</strong> Please bring this ticket and a valid ID to the event.
            </div>
            
            <div class="footer">
              <div>Generated by ExplorAdama</div>
              <div>${new Date().toLocaleDateString()}</div>
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(html);
        printWindow?.document.close();
        printWindow?.print();
      } else {
        await Sharing.shareAsync({ html, mimeType: 'text/html' });
      }
    } catch (error) {
      console.error('Failed to print ticket', error);
      Alert.alert('Error', 'Failed to generate printable version');
    }
  };

  const handleAddToWallet = () => {
    Alert.alert(
      'Add to Wallet',
      'This feature is coming soon! You\'ll be able to add tickets to Apple Wallet/Google Pay.',
      [{ text: 'OK' }]
    );
  };

  const handleReportIssue = () => {
    Alert.prompt(
      'Report Issue',
      'Please describe the issue with your ticket:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: (description?: string | undefined) => {
            if (description) {
              // In real app, send to backend
              Alert.alert('Report Submitted', 'Thank you! We\'ll review your issue.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ticket Actions</Text>
      
      <View style={styles.actionsGrid}>
        {/* Row 1 */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              Share
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.secondary}15` }]}
            onPress={handleSaveToGallery}
            disabled={!qrImageUri}
          >
            <Ionicons 
              name="download" 
              size={24} 
              color={qrImageUri ? colors.secondary : colors.textTertiary} 
            />
            <Text style={[
              styles.actionText,
              { color: qrImageUri ? colors.secondary : colors.textTertiary }
            ]}>
              Save
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.success}15` }]}
            onPress={handlePrint}
          >
            <Ionicons name="print" size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>
              Print
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.warning}15` }]}
            onPress={handleAddToWallet}
          >
            <Ionicons name="wallet" size={24} color={colors.warning} />
            <Text style={[styles.actionText, { color: colors.warning }]}>
              Wallet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 - Calendar & Reminder */}
        {(onAddToCalendar || onSetReminder) && (
          <View style={styles.specialActions}>
            {onAddToCalendar && (
              <Button
                title="Add to Calendar"
                variant="outline"
                onPress={onAddToCalendar}
                leftIcon={<Ionicons name="calendar" size={20} />}
                style={styles.specialButton}
              />
            )}
            
            {onSetReminder && (
              <Button
                title="Set Reminder"
                variant="outline"
                onPress={onSetReminder}
                leftIcon={<Ionicons name="notifications" size={20} />}
                style={styles.specialButton}
              />
            )}
          </View>
        )}

        {/* Report Issue */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportIssue}
        >
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={[styles.reportText, { color: colors.error }]}>
            Report an Issue
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Use Your Ticket:</Text>
        <Text style={styles.instruction}>• Present QR code at entrance for scanning</Text>
        <Text style={styles.instruction}>• Bring a valid ID matching ticket details</Text>
        <Text style={styles.instruction}>• Arrive 15-30 minutes before event start</Text>
        <Text style={styles.instruction}>• Save ticket offline for reliable access</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  specialActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  specialButton: {
    flex: 1,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    gap: 8,
    marginTop: 8,
  },
  reportText: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 6,
    marginLeft: 4,
  },
});