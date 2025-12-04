import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { RatingStars } from '../../reviews/components/RatingStars';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { useDiscovery } from '../hooks/useDiscovery';
import { useFavorites } from '../../favorites/hooks/useFavorites';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type PlaceDetailScreenProps = {
  route: RouteProp<{ params: { placeId: string } }, 'params'>;
  navigation: any;
};

export const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { placeId } = route.params;
  const { colors } = useTheme();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const {
    placeDetail,
    isLoading,
    error,
    getPlaceDetail,
  } = useDiscovery();

  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading: favoriteLoading,
  } = useFavorites();

  useEffect(() => {
    getPlaceDetail(placeId);
  }, [placeId]);

  const handleFavoriteToggle = async () => {
    if (!placeDetail) return;

    try {
      if (isFavorite(placeId, 'PLACE')) {
        await removeFromFavorites(placeId, 'PLACE');
      } else {
        await addToFavorites(placeId, 'PLACE');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleBookNow = () => {
    if (placeDetail) {
      navigation.navigate('Booking', { 
        placeId: placeDetail.id,
        placeName: placeDetail.name,
      });
    }
  };

  const handleOpenMap = () => {
    if (placeDetail) {
      const url = `https://maps.google.com/?q=${placeDetail.latitude},${placeDetail.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open maps app');
      });
    }
  };

  const handleViewReviews = () => {
    navigation.navigate('Reviews', { 
      placeId: placeId,
      placeName: placeDetail?.name,
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !placeDetail) {
    return (
      <ErrorState
        message="Failed to load place details"
        onRetry={() => getPlaceDetail(placeId)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {placeDetail.images.length > 0 ? (
            <>
              <Image
                source={{ uri: placeDetail.images[activeImageIndex].url }}
                style={styles.mainImage}
              />
              
              {placeDetail.images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailContainer}
                >
                  {placeDetail.images.map((image: { id: string; url: string }, index: number) => (
                    <TouchableOpacity
                      key={image.id}
                      onPress={() => setActiveImageIndex(index)}
                    >
                      <Image
                        source={{ uri: image.url }}
                        style={[
                          styles.thumbnail,
                          index === activeImageIndex && styles.activeThumbnail,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={[styles.mainImage, styles.placeholderImage]}>
              <Text>No Image Available</Text>
            </View>
          )}
          
          {/* Favorite Button */}
          <View style={styles.favoriteButton}>
              <FavoriteButton
                isFavorite={isFavorite(placeId, 'PLACE')}
                onToggle={handleFavoriteToggle}
                isLoading={favoriteLoading}
                size="large"
              />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text variant="h1" style={styles.title}>
                {placeDetail.name}
              </Text>
            </View>
            
            {placeDetail.category && (
              <Text style={styles.category}>
                {placeDetail.category.name}
              </Text>
            )}

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <RatingStars
                rating={placeDetail.avgRating || 0}
                size={20}
                showRating
              />
              <Text style={styles.reviewCount}>
                ({placeDetail.reviews?.length || 0} reviews)
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{placeDetail.viewCount}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{placeDetail.bookingCount}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {placeDetail.avgRating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Description */}
          {placeDetail.description && (
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                About
              </Text>
              <Text style={styles.description}>
                {placeDetail.description}
              </Text>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Location
            </Text>
            {placeDetail.address && (
              <Text style={styles.address}>
                {placeDetail.address}
              </Text>
            )}
            <Button
              title="Open in Maps"
              variant="outline"
              onPress={handleOpenMap}
              style={styles.mapButton}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Book Now"
              onPress={handleBookNow}
              fullWidth
              style={styles.bookButton}
            />
            
            <Button
              title="View Reviews"
              variant="outline"
              onPress={handleViewReviews}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaceDetailScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    opacity: 0.7,
  },
  activeThumbnail: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 8,
    opacity: 0.7,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
    opacity: 0.8,
  },
  address: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  mapButton: {
    alignSelf: 'flex-start',
  },
  actions: {
    gap: 12,
  },
  bookButton: {
    marginBottom: 8,
  },
});