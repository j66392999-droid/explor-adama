// features/tickets/components/TicketCard.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Ticket, TICKET_STATUSES } from '../types/tickets.types';
import { formatDate, formatTime } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface TicketCardProps {
  ticket: Ticket;
  onPress?: () => void;
  variant?: 'default' | 'compact';
  showEventImage?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onPress,
  variant = 'default',
  showEventImage = true,
}) => {
  const { colors } = useTheme();
  const status = TICKET_STATUSES[ticket.status];
  const event = ticket.event;

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const renderCompact = () => (
    <TouchableOpacity
      style={[styles.compactContainer, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.compactHeader}>
        {showEventImage && (
          <Image
            source={{ 
              uri: event?.images?.[0]?.url || 'https://via.placeholder.com/60'
            }}
            style={styles.compactImage}
          />
        )}
        
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {event?.title || `Ticket ${ticket.id.slice(-8)}`}
          </Text>
          
          <View style={styles.compactDetails}>
            <Text style={styles.compactDate}>
              {event?.date ? formatDate(event.date, 'short') : ''}
            </Text>
            {event?.startTime && (
              <Text style={styles.compactTime}>
                {formatTime(event.startTime)}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.compactRight}>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
          
          {ticket.seat && (
            <Text style={styles.seatText}>
              Seat: {ticket.seat}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (variant === 'compact') {
    return renderCompact();
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Status indicator */}
      <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.ticketNumber}>
              Ticket #{ticket.id.slice(-8)}
            </Text>
            <View style={[styles.statusTag, { backgroundColor: `${status.color}20` }]}>
              <Ionicons name={status.icon as any} size={14} color={status.color} />
              <Text style={[styles.statusTagText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.issuedDate}>
            Issued: {formatDate(ticket.issuedAt, 'short')}
          </Text>
        </View>

        {/* Event Details */}
        <View style={styles.eventSection}>
          {showEventImage && (
            <Image
              source={{ 
                uri: event?.images?.[0]?.url || 'https://via.placeholder.com/80'
              }}
              style={styles.eventImage}
            />
          )}
          
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event?.title || 'Event Ticket'}
            </Text>
            
            {event?.description && (
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
            )}
            
            <View style={styles.eventInfo}>
              {event?.date && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {formatDate(event.date, 'medium')}
                  </Text>
                </View>
              )}
              
              {event?.startTime && (
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </Text>
                </View>
              )}
              
              {event?.place?.name && (
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {event.place.name}
                  </Text>
                </View>
              )}
              
              {ticket.seat && (
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    Seat: {ticket.seat}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.qrPreview}>
            <Ionicons name="qr-code" size={20} color={colors.textSecondary} />
            <Text style={styles.qrText}>
              QR Code Available
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    height: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  issuedDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  eventSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 18,
  },
  eventInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  qrPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrText: {
    fontSize: 14,
    opacity: 0.6,
  },
  // Compact variant
  compactContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  compactDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  compactTime: {
    fontSize: 14,
    opacity: 0.6,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  seatText: {
    fontSize: 12,
    opacity: 0.7,
  },
});