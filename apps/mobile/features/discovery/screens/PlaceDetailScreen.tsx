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
import { PlaceCard } from '../components/PlaceCard';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type PlaceDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlaceDetail'>;
type PlaceDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlaceDetail'>;

export const PlaceDetailScreen: React.FC = () => {
  const navigation = useNavigation<PlaceDetailScreenNavigationProp>();
  const route = useRoute<PlaceDetailScreenRouteProp>();
  const { placeId } = route.params;
  
  const { colors } = useTheme();
  const { getPlaceDetail } = useDiscovery();
  
  const [place, setPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarPlaces, setSimilarPlaces] = useState<any[]>([]);

  useEffect(() => {
    loadPlaceDetail();
  }, [placeId]);

  const loadPlaceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const placeDetail = await getPlaceDetail(placeId);
      setPlace(placeDetail);
      
      // Load similar places
      // In a real app, this would come from the API
      setSimilarPlaces([]);
    } catch (err: any) {
      setError(err.message || 'Failed to load place details');
      console.error('Failed to load place detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    if (place?.contactInfo?.phone) {
      Linking.openURL(`tel:${place.contactInfo.phone}`);
    }
  };

  const handleDirections = () => {
    if (place?.latitude && place?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${place?.name} on ExplorAdama!`,
        url: `https://exploradama.com/places/${placeId}`,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleBookPress = () => {
    navigation.navigate('Booking', { placeId });
  };

  const handleSimilarPlacePress = (similarPlace: any) => {
    navigation.push('PlaceDetail', { placeId: similarPlace.id });
  };

  const handleFavoriteToggle = (isFavorited: boolean) => {
    // Track analytics when favorite is toggled
    console.log(`Place ${placeId} favorited: ${isFavorited}`);
    // Add analytics tracking here if needed
  };

  if (isLoading) {
    return <Loading message="Loading place details..." />;
  }

  if (error || !place) {
    return <ErrorState message={error || 'Place not found'} onRetry={loadPlaceDetail} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: place.images[0]?.url }}
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
                itemId={placeId}
                itemType="PLACE"
                size="large"
                onToggle={handleFavoriteToggle}
              />
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Category */}
          <View style={styles.header}>
            <Text variant="large" style={styles.title}>{place.name}</Text>
            {place.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {place.category.name}
                </Text>
              </View>
            )}
          </View>

          {/* Rating and Views */}
          <View style={styles.metaInfo}>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {place.avgRating?.toFixed(1) || 'New'}</Text>
              <Text style={styles.views}>👁️ {place.viewCount} views</Text>
            </View>
            <Text style={styles.bookings}>📅 {place.bookingCount} bookings</Text>
          </View>

          {/* Description */}
          {place.description && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{place.description}</Text>
            </View>
          )}

          {/* Contact Info */}
          {place.contactInfo && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Contact Information</Text>
              {place.contactInfo.phone && (
                <TouchableOpacity 
                  style={styles.contactItem} 
                  onPress={handleCall}
                >
                  <Ionicons name="call-outline" size={20} color={colors.text} />
                  <Text style={styles.contactText}>{place.contactInfo.phone}</Text>
                </TouchableOpacity>
              )}
              {place.contactInfo.email && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`mailto:${place.contactInfo.email}`)}
                >
                  <Ionicons name="mail-outline" size={20} color={colors.text} />
                  <Text style={styles.contactText}>{place.contactInfo.email}</Text>
                </TouchableOpacity>
              )}
              {place.contactInfo.website && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(place.contactInfo.website)}
                >
                  <Ionicons name="globe-outline" size={20} color={colors.text} />
                  <Text style={styles.contactText}>Visit Website</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Address */}
          {place.address && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Location</Text>
              <Text style={styles.address}>{place.address}</Text>
              <Button
                title="Get Directions"
                variant="outline"
                onPress={handleDirections}
                style={styles.directionsButton}
              />
            </View>
          )}

          {/* Opening Hours */}
          {place.openingHours && place.openingHours.length > 0 && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Opening Hours</Text>
              {place.openingHours.map((hour: any, index: number) => (
                <View key={index} style={styles.hourItem}>
                  <Text style={styles.hourDay}>{hour.day}</Text>
                  <Text style={[
                    styles.hourTime,
                    hour.isClosed && { color: '#FF3B30' },
                  ]}>
                    {hour.isClosed ? 'Closed' : `${hour.openingTime} - ${hour.closingTime}`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Amenities */}
          {place.amenities && place.amenities.length > 0 && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {place.amenities.map((amenity: string, index: number) => (
                  <View key={index} style={[styles.amenityBadge, { backgroundColor: colors.surface }]}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Similar Places */}
          {similarPlaces.length > 0 && (
            <View style={styles.section}>
              <Text variant="small" style={styles.sectionTitle}>Similar Places</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarPlaces.map((similarPlace) => (
                  <PlaceCard
                    key={similarPlace.id}
                    place={similarPlace}
                    onPress={() => handleSimilarPlacePress(similarPlace)}
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
      <View style={[styles.actionBar, { backgroundColor: colors.surface }]}>
        <Button
          title="Book Now"
          onPress={handleBookPress}
          style={styles.bookButton}
        />
      </View>
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
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bookings: {
    fontSize: 14,
    opacity: 0.7,
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    opacity: 0.8,
  },
  address: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
  },
  directionsButton: {
    alignSelf: 'flex-start',
  },
  hourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  hourDay: {
    fontSize: 14,
    fontWeight: '500',
  },
  hourTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
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