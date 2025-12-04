import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { logger } from '../../../shared/utils/logging/logger';
import { Button } from '../../../components/ui/Button';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { Recommendation } from '../types/home.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useFavorites } from '../../favorites/hooks/useFavorites';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress: (item: any) => void;
  style?: any;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onPress,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const item = recommendation.item;
  if (!item) return null;

  const isEvent = 'title' in item;
  const imageUrl = item.images[0]?.url;
  const title = isEvent ? item.title : item.name;
  const description = isEvent ? item.description : item.description;
  const itemId = item.id;
  const itemType = isEvent ? 'EVENT' : 'PLACE';

  const handleFavoritePress = async () => {
    try {
      if (isFavorite(itemId, itemType)) {
        await removeFromFavorites(itemId, itemType);
      } else {
        await addToFavorites(itemId, itemType);
      }
    } catch (error: any) {
      try { logger.error('Failed to toggle favorite', error); } catch { try { console.error(`Failed to toggle favorite: ${error?.message || error}`); } catch {} }
    }
  };

  const handlePress = () => {
    onPress(item);
  };

  const getPriceInfo = () => {
    if (isEvent && (item as any).price !== undefined) {
      const price = (item as any).price;
      return price > 0 ? `$${price.toFixed(2)}` : 'Free';
    }
    return null;
  };

  const getRatingInfo = () => {
    const rating = (item as any).avgRating;
    return rating ? rating.toFixed(1) : null;
  };

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
          source={{ uri: imageUrl }}
          style={styles.image}
          defaultSource={require('../../../assets/images/placeholder-image.png')}
        />
        
        <View style={styles.favoriteButton}>
          <FavoriteButton
            isFavorite={isFavorite(itemId, itemType)}
            onToggle={handleFavoritePress}
            size="medium"
          />
        </View>

        {recommendation.score > 0.8 && (
          <View style={styles.highScoreBadge}>
            <Text style={styles.highScoreText}>🔥 Top Pick</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="small" style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {isEvent ? 'Event' : 'Place'}
            </Text>
          </View>
        </View>

        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        <View style={styles.metaInfo}>
          {isEvent ? (
            <>
              <Text style={styles.date}>
                {new Date((item as any).date).toLocaleDateString()}
              </Text>
              {getPriceInfo() && (
                <Text style={styles.price}>{getPriceInfo()}</Text>
              )}
            </>
          ) : (
            <>
              {getRatingInfo() && (
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>⭐ {getRatingInfo()}</Text>
                </View>
              )}
              <Text style={styles.views}>
                👁️ {(item as any).viewCount || 0}
              </Text>
            </>
          )}
        </View>

        {recommendation.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonText}>
              {recommendation.reason}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title={isEvent ? 'Book Now' : 'Explore'}
            size="small"
            onPress={handlePress}
            style={styles.actionButton}
          />
          
          {recommendation.score && (
            <Text style={styles.confidenceText}>
              {Math.round(recommendation.score * 100)}% match
            </Text>
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
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  highScoreBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 69, 58, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
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
  typeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976D2',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    lineHeight: 18,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.8,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  views: {
    fontSize: 12,
    opacity: 0.7,
  },
  reasonContainer: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});