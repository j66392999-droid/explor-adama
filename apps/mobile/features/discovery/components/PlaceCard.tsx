import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { Place } from '../types/discovery.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useFavorites } from '../../favorites/hooks/useFavorites';

interface PlaceCardProps {
  place: Place;
  onPress: (place: Place) => void;
  onBookPress?: (place: Place) => void;
  variant?: 'default' | 'compact' | 'featured';
  style?: any;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onPress,
  onBookPress,
  variant = 'default',
  style,
}) => {
  const { colors, spacing } = useTheme();
  const { isFavorite } = useFavorites();



  const handlePress = () => {
    onPress(place);
  };

  const handleBookPress = () => {
    onBookPress?.(place);
  };

  const getDistance = () => {
    // This would calculate actual distance using coordinates
    // For now, return mock distance
    return '1.2 km';
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          { backgroundColor: colors.surface },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: place.images[0]?.url }}
          style={styles.compactImage}
          defaultSource={require('../../../assets/images/placeholder-image.png')}
        />
        <View style={styles.compactContent}>
          <Text numberOfLines={1} style={styles.compactTitle}>
            {place.name}
          </Text>
          <Text style={styles.compactDescription} numberOfLines={1}>
            {place.description}
          </Text>
          <View style={styles.compactFooter}>
            <Text style={styles.compactRating}>
              ⭐ {place.avgRating?.toFixed(1) || 'New'}
            </Text>
            <Text style={styles.compactDistance}>
              📍 {getDistance()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={[
          styles.featuredContainer,
          { backgroundColor: colors.surface },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.featuredImageContainer}>
          <Image
            source={{ uri: place.images[0]?.url }}
            style={styles.featuredImage}
            defaultSource={require('../../../assets/images/placeholder-image.png')}
          />
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        </View>
        
        <View style={styles.featuredContent}>
          <Text variant="body" numberOfLines={2} style={styles.featuredTitle}>
            {place.name}
          </Text>
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {place.description}
          </Text>
          
          <View style={styles.featuredMeta}>
            <View style={styles.featuredStats}>
              <Text style={styles.featuredRating}>
                ⭐ {place.avgRating?.toFixed(1) || 'New'}
              </Text>
              <Text style={styles.featuredViews}>
                👁️ {place.viewCount}
              </Text>
              <Text style={styles.featuredDistance}>
                📍 {getDistance()}
              </Text>
            </View>
            
            <FavoriteButton
              itemId={place.id}
              itemType="PLACE"
              size="small"
            />
          </View>
          
          {onBookPress && (
            <Button
              title="Book Now"
              size="small"
              onPress={handleBookPress}
              style={styles.bookButton}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: place.images[0]?.url }}
          style={styles.image}
          defaultSource={require('../../../assets/images/placeholder-image.png')}
        />
        
        <View style={styles.favoriteButton}>
          <FavoriteButton
            itemId={place.id}
            itemType="PLACE"
            size="medium"
          />
        </View>

        {place.bookingCount > 100 && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>🔥 Popular</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="small" numberOfLines={2} style={styles.title}>
            {place.name}
          </Text>
          
          {place.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {place.category.name}
              </Text>
            </View>
          )}
        </View>

        {place.description && (
          <Text style={styles.description} numberOfLines={2}>
            {place.description}
          </Text>
        )}
        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {place.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag.tag.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.metaInfo}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              ⭐ {place.avgRating?.toFixed(1) || 'New'}
            </Text>
            <Text style={styles.reviewCount}>
              ({place.viewCount || 0} views)
            </Text>
          </View>
          
          <Text style={styles.distance}>
            📍 {getDistance()}
          </Text>
        </View>

        <View style={styles.footer}>
          {place.address && (
            <Text style={styles.address} numberOfLines={1}>
              {place.address}
            </Text>
          )}
          
          {onBookPress && (
            <Button
              title="Explore"
              size="small"
              variant="outline"
              onPress={handleBookPress}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featuredContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  popularBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 69, 58, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    padding: 12,
  },
  compactContent: {
    flex: 1,
  },
  featuredContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 18,
  },
  compactDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  compactRating: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredRating: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  distance: {
    fontSize: 12,
    opacity: 0.7,
  },
  compactDistance: {
    fontSize: 10,
    opacity: 0.7,
  },
  featuredDistance: {
    fontSize: 14,
    opacity: 0.8,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featuredViews: {
    fontSize: 14,
    opacity: 0.7,
  },

  /* Tags */
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  address: {
    flex: 1,
    fontSize: 12,
    opacity: 0.6,
    marginRight: 12,
  },
  bookButton: {
    minWidth: 100,
  },
});