import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EventCard } from '../components/EventCard';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type EventDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;
type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation<EventDetailScreenNavigationProp>();
  const route = useRoute<EventDetailScreenRouteProp>();
  const { eventId } = route.params;
  
  const { colors } = useTheme();
  const { getEventDetail } = useDiscovery();
  
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarEvents, setSimilarEvents] = useState<any[]>([]);

  useEffect(() => {
    loadEventDetail();
  }, [eventId]);

  const loadEventDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const eventDetail = await getEventDetail(eventId);
      setEvent(eventDetail);
      
      // Load similar events
      // In a real app, this would come from the API
      setSimilarEvents([]);
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
      console.error('Failed to load event detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event?.title} on ExplorAdama!`,
        url: `https://exploradama.com/events/${eventId}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleBookPress = () => {
    navigation.navigate('Booking', { eventId });
  };

  const handleOrganizerPress = () => {
    if (event?.organizer) {
      // Navigate to organizer profile
      console.log('Navigate to organizer:', event.organizer.id);
    }
  };

  const handleSimilarEventPress = (similarEvent: any) => {
    navigation.push('EventDetail', { eventId: similarEvent.id });
  };

  const handleFavoriteToggle = (isFavorited: boolean) => {
    // Track analytics when favorite is toggled
    console.log(`Event ${eventId} favorited: ${isFavorited}`);
    // Add analytics tracking here if needed
  };

  const handleDirections = () => {
    if (event?.place?.latitude && event?.place?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${event.place.latitude},${event.place.longitude}`;
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return <Loading message="Loading event details..." />;
  }

  if (error || !event) {
    return <ErrorState message={error || 'Event not found'} onRetry={loadEventDetail} />;
  }

  const isSoldOut = event.capacity && (event.bookingCount >= event.capacity);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: event.images[0]?.url }}
            style={styles.heroImage}
            defaultSource={require('../../../assets/images/placeholder-image.png')}
          />
          
          <View style={styles.heroOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="black" />
              </TouchableOpacity>
              
              {/* Professional FavoriteButton usage */}
              <FavoriteButton
                itemId={eventId}
                itemType="EVENT"
                size="large"
                onToggle={handleFavoriteToggle}
              />
            </View>
          </View>

          {isSoldOut && (
            <View style={styles.soldOutBanner}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Category */}
          <View style={styles.header}>
            <Text variant="large" style={styles.title}>{event.title}</Text>
            {event.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {event.category.name}
                </Text>
              </View>
            )}
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Date</Text>
              <Text style={styles.dateTimeValue}>{formatDate(event.date)}</Text>
            </View>
            {event.startTime && (
              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>Time</Text>
                <Text style={styles.dateTimeValue}>
                  {formatTime(event.startTime)}
                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                </Text>
              </View>
            )}
          </View>

          {/* Rating and Attendance */}
          <View style={styles.metaInfo}>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {event.avgRating?.toFixed(1) || 'New'}</Text>
              <Text style={styles.views}>👁️ {event.viewCount} views</Text>
            </View>
            <View style={styles.attendanceContainer}>
              <Text style={styles.attendance}>
                👥 {event.bookingCount || 0} attending
                {event.capacity && ` / ${event.capacity}`}
              </Text>
              {event.price !== undefined && (
                <Text style={styles.price}>
                  {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                </Text>
              )}
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Location */}
          {event.place && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationContainer}>
                <Text style={styles.locationName}>{event.place.name}</Text>
                {event.place.address && (
                  <Text style={styles.locationAddress}>{event.place.address}</Text>
                )}
                <Button
                  title="Get Directions"
                  variant="outline"
                  onPress={handleDirections}
                  style={styles.directionsButton}
                />
              </View>
            </View>
          )}

          {/* Organizer */}
          {event.organizer && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Organizer</Text>
              <TouchableOpacity
                style={styles.organizerContainer}
                onPress={handleOrganizerPress}
              >
                {event.organizer.avatar ? (
                  <Image
                    source={{ uri: event.organizer.avatar }}
                    style={styles.organizerAvatar}
                  />
                ) : (
                  <View style={[styles.organizerAvatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.organizerInitial, { color: colors.primary }]}>
                      {event.organizer.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.organizerInfo}>
                  <Text style={styles.organizerName}>{event.organizer.name}</Text>
                  {event.organizer.rating && (
                    <Text style={styles.organizerRating}>
                      ⭐ {event.organizer.rating.toFixed(1)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Tickets */}
          {event.tickets && event.tickets.length > 0 && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Tickets</Text>
              {event.tickets.map((ticket: any, index: number) => (
                <View key={index} style={[styles.ticketItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketType}>{ticket.type}</Text>
                    <Text style={styles.ticketDescription}>{ticket.description}</Text>
                    {ticket.benefits && ticket.benefits.length > 0 && (
                      <View style={styles.ticketBenefits}>
                        {ticket.benefits.map((benefit: string, benefitIndex: number) => (
                          <Text key={benefitIndex} style={styles.ticketBenefit}>
                            ✓ {benefit}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.ticketPriceContainer}>
                    <Text style={styles.ticketPrice}>
                      ${ticket.price.toFixed(2)}
                    </Text>
                    <Text style={styles.ticketAvailability}>
                      {ticket.available} left
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Similar Events */}
          {similarEvents.length > 0 && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Similar Events</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarEvents.map((similarEvent) => (
                  <EventCard
                    key={similarEvent.id}
                    event={similarEvent}
                    onPress={() => handleSimilarEventPress(similarEvent)}
                    variant="compact"
                    style={styles.similarCard}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isSoldOut && (
        <View style={[styles.actionBar, { backgroundColor: colors.surface }]}>
          <Button
            title="Book Now"
            onPress={handleBookPress}
            style={styles.bookButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  soldOutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaInfo: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
  },
  views: {
    fontSize: 14,
    opacity: 0.7,
  },
  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendance: {
    fontSize: 14,
    opacity: 0.8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  locationContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  directionsButton: {
    alignSelf: 'flex-start',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  organizerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  organizerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  organizerRating: {
    fontSize: 14,
    opacity: 0.7,
  },
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  ticketBenefits: {
    marginTop: 4,
  },
  ticketBenefit: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  ticketPriceContainer: {
    alignItems: 'flex-end',
  },
  ticketPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  ticketAvailability: {
    fontSize: 12,
    opacity: 0.7,
  },
  similarCard: {
    width: 200,
    marginRight: 12,
  },
  actionBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButton: {
    flex: 1,
  },
});