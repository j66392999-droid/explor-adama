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
import { Event } from '../types/discovery.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useFavorites } from '../../favorites/hooks/useFavorites';

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  onBookPress?: (event: Event) => void;
  variant?: 'default' | 'compact' | 'featured';
  style?: any;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onBookPress,
  variant = 'default',
  style,
}) => {
  const { colors, spacing } = useTheme();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const handleFavoritePress = async () => {
    try {
      if (isFavorite(event.id, 'EVENT')) {
        await removeFromFavorites(event.id, 'EVENT');
      } else {
        await addToFavorites(event.id, 'EVENT');
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const handlePress = () => {
    onPress(event);
  };

  const handleBookPress = () => {
    onBookPress?.(event);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getPriceDisplay = () => {
    if (event.price === undefined) return 'Price TBA';
    if (event.price === 0) return 'Free';
    return `$${event.price.toFixed(2)}`;
  };

const getAvailability = () => {
  if (!event.capacity) return null;
  const available = event.capacity - (event.bookingCount || 0);
  if (available <= 0) return 'Sold Out';
  if (available < 10) return `${available} spots left`;
  return 'Available';
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
          source={{ uri: event.images[0]?.url }}
          style={styles.compactImage}
          defaultSource={require('../../../assets/images/placeholder-image.png')}
        />
        <View style={styles.compactContent}>
          <Text numberOfLines={1} style={styles.compactTitle}>
            {event.title}
          </Text>
          <Text style={styles.compactDate} numberOfLines={1}>
            {formatDate(event.date)}
          </Text>
          <View style={styles.compactFooter}>
            <Text style={styles.compactPrice}>
              {getPriceDisplay()}
            </Text>
            <Text style={[
              styles.compactAvailability,
              { color: getAvailability() === 'Sold Out' ? '#FF3B30' : '#4CAF50' },
            ]}>
              {getAvailability()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    const isSoldOut = getAvailability() === 'Sold Out';
    
    return (
      <TouchableOpacity
        style={[
          styles.featuredContainer,
          { backgroundColor: colors.surface },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={isSoldOut}
      >
        <View style={styles.featuredImageContainer}>
          <Image
            source={{ uri: event.images[0]?.url }}
            style={styles.featuredImage}
            defaultSource={require('../../../assets/images/placeholder-image.png')}
          />
          {isSoldOut && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
          <View style={styles.featuredDateBadge}>
            <Text style={styles.featuredDateText}>
              {formatDate(event.date)}
            </Text>
          </View>
        </View>
        
        <View style={styles.featuredContent}>
          <Text variant="body" numberOfLines={2} style={styles.featuredTitle}>
            {event.title}
          </Text>
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {event.description}
          </Text>
          
          <View style={styles.featuredMeta}>
            <View style={styles.featuredInfo}>
              {event.place && (
                <Text style={styles.featuredLocation} numberOfLines={1}>
                  📍 {event.place.name}
                </Text>
              )}
              <Text style={styles.featuredTime}>
                ⏰ {formatTime(event.startTime)}
              </Text>
            </View>
            
            <FavoriteButton
              isFavorite={isFavorite(event.id, 'EVENT')}
              onToggle={handleFavoritePress}
              size="small"
            />
          </View>
          
          <View style={styles.featuredFooter}>
            <Text style={styles.featuredPrice}>
              {getPriceDisplay()}
            </Text>
            
            {!isSoldOut && onBookPress && (
              <Button
                title="Book Now"
                size="small"
                onPress={handleBookPress}
                style={styles.bookButton}
              />
            )}
            
            {isSoldOut && (
              <View style={styles.soldOutBadge}>
                <Text style={styles.soldOutBadgeText}>Sold Out</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  const isSoldOut = getAvailability() === 'Sold Out';
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={isSoldOut}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.images[0]?.url }}
          style={styles.image}
          defaultSource={require('../../../assets/images/placeholder-image.png')}
        />
        
        <View style={styles.favoriteButton}>
          <FavoriteButton
            isFavorite={isFavorite(event.id, 'EVENT')}
            onToggle={handleFavoritePress}
            size="medium"
          />
        </View>

        {isSoldOut && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}

        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>
            {formatDate(event.date)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="small" numberOfLines={2} style={styles.title}>
            {event.title}
          </Text>
          
          {event.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {event.category.name}
              </Text>
            </View>
          )}
        </View>

        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <View style={styles.metaInfo}>
          <View style={styles.timeLocation}>
            {event.startTime && (
              <Text style={styles.time}>
                ⏰ {formatTime(event.startTime)}
              </Text>
            )}
            {event.place && (
              <Text style={styles.location} numberOfLines={1}>
                📍 {event.place.name}
              </Text>
            )}
          </View>
          
          <Text style={[
            styles.availability,
            { color: isSoldOut ? '#FF3B30' : '#4CAF50' },
          ]}>
            {getAvailability()}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {getPriceDisplay()}
            </Text>
            {event.avgRating && (
              <Text style={styles.rating}>
                ⭐ {event.avgRating.toFixed(1)}
              </Text>
            )}
          </View>
          
          {!isSoldOut && onBookPress && (
            <Button
              title="Book"
              size="small"
              onPress={handleBookPress}
            />
          )}
          
          {isSoldOut && (
            <View style={styles.soldOutIndicator}>
              <Text style={styles.soldOutIndicatorText}>Sold Out</Text>
            </View>
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
  dateBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    transform: [{ rotate: '-15deg' }],
  },
  featuredImageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredDateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredDateText: {
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
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D32F2F',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 18,
  },
  compactDate: {
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
  timeLocation: {
    flex: 1,
  },
  time: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    opacity: 0.6,
  },
  availability: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactAvailability: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredLocation: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  featuredTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  rating: {
    fontSize: 12,
    opacity: 0.8,
  },
  soldOutIndicator: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soldOutIndicatorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
  },
  soldOutBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  soldOutBadgeText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButton: {
    minWidth: 100,
  },
});