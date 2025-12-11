import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Booking, BOOKING_STATUSES } from '../types/booking.types';
import { formatDate, formatTime, formatCurrency } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  variant?: 'default' | 'compact';
  style?: any;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
  variant = 'default',
  style,
}) => {
  const { colors } = useTheme();
  
  const status = BOOKING_STATUSES[booking.status] || BOOKING_STATUSES.PENDING;
  const event = booking.event || booking.place;

  const getEventName = (e?: any) => {
    if (!e) return '';
    if ('title' in e && typeof e.title === 'string') return e.title;
    if ('name' in e && typeof e.name === 'string') return e.name;
    return '';
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const renderCompact = () => (
    <TouchableOpacity
      style={[styles.compactContainer, { backgroundColor: colors.surface }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.compactHeader}>
        <Image
          source={{ uri: event?.images[0]?.url || 'https://via.placeholder.com/60' }}
          style={styles.compactImage}
        />
        
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {getEventName(event)}
          </Text>
          
          <View style={styles.compactDetails}>
            <Text style={styles.compactDate}>
              {formatDate(booking.bookingDate, 'short')}
            </Text>
            <Text style={styles.compactTime}>
              {booking.event?.startTime ? formatTime(booking.event.startTime) : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.compactRight}>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
          
          <Text style={styles.compactPrice}>
            {formatCurrency(booking.total, 'ETB')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (variant === 'compact') {
    return renderCompact();
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Status Badge */}
      <View style={[styles.statusBar, { backgroundColor: status.color }]} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.confirmationNumber}>
              #{booking.id.slice(-8)}
            </Text>
            <View style={[styles.statusTag, { backgroundColor: status.color + '20' }]}>
              <Ionicons name={status.icon as any} size={14} color={status.color} />
              <Text style={[styles.statusTagText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.date}>
            {formatDate(booking.createdAt, 'short')}
          </Text>
        </View>

        {/* Event Details */}
        <View style={styles.eventSection}>
          <Image
            source={{ uri: event?.images[0]?.url || 'https://via.placeholder.com/80' }}
            style={styles.eventImage}
          />
          
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {getEventName(event)}
            </Text>
            
            <View style={styles.eventInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {formatDate(booking.bookingDate, 'medium')}
                </Text>
              </View>
              
              {booking.event?.startTime && (
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {formatTime(booking.event.startTime)}
                    {booking.event.endTime && ` - ${formatTime(booking.event.endTime)}`}
                  </Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Ionicons name="people" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {booking.quantity} guest{booking.quantity !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price & Actions */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>
              {formatCurrency(booking.total, 'ETB')}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <Button
              title="View Details"
              variant="outline"
              size="small"
              onPress={handlePress}
            />
          </View>
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
  statusBar: {
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
  confirmationNumber: {
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
  date: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
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
  totalLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
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
  compactPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});