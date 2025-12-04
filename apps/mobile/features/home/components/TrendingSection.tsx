import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import  { Button } from '../../../components/ui/Button';
import { Event } from '../types/home.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface TrendingSectionProps {
  events: Event[];
  onEventPress: (event: Event) => void;
  onSeeAllPress?: () => void;
  style?: any;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  events,
  onEventPress,
  onSeeAllPress,
  style,
}) => {
  const { colors } = useTheme();

  if (events.length === 0) {
    return null;
  }

  const renderEventCard = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={[
        styles.eventCard,
        { backgroundColor: colors.surface },
      ]}
      onPress={() => onEventPress(event)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: event.images[0]?.url }}
        style={styles.eventImage}
        // Fallback to an available asset to prevent bundler errors
        defaultSource={require('../../../assets/illustrations/search.png')}
      />
      
      <View style={styles.eventContent}>
        <Text variant="small" numberOfLines={2} style={styles.eventTitle}>
          {event.title}
        </Text>
        
        <Text style={styles.eventDate} numberOfLines={1}>
          {new Date(event.date).toLocaleDateString()}
          {event.startTime && ` • ${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </Text>
        
        <Text style={styles.eventLocation} numberOfLines={1}>
          {event.place?.name || 'Location TBA'}
        </Text>

        <View style={styles.eventFooter}>
          <View style={styles.eventStats}>
            {event.avgRating && (
              <Text style={styles.rating}>
                ⭐ {event.avgRating.toFixed(1)}
              </Text>
            )}
            <Text style={styles.attendees}>
              👥 {event.bookingCount || 0}
            </Text>
          </View>
          
          {event.price !== undefined && event.price > 0 && (
            <Text style={styles.price}>
              ${event.price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View>
          <Text variant="small" style={styles.title}>
            Trending Events
          </Text>
          <Text style={styles.subtitle}>
            Popular events happening near you
          </Text>
        </View>
        
        {onSeeAllPress && (
          <Button
            title="See All"
            variant="ghost"
            size="small"
            onPress={onSeeAllPress}
          />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {events.map(renderEventCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  eventCard: {
    width: 280,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    marginBottom: 4,
    lineHeight: 20,
  },
  eventDate: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendees: {
    fontSize: 12,
    opacity: 0.7,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});