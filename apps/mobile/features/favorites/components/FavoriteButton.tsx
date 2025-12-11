import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useFavorites } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  itemId?: string;
  itemType?: 'PLACE' | 'EVENT';
  /**
   * Controlled favorite state. If provided, the button will render this state
   * instead of deriving it from `useFavorites`.
   */
  isFavorite?: boolean;
  size?: 'small' | 'medium' | 'large';
  onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType,
  isFavorite: controlledIsFavorite,
  size = 'medium',
  onToggle,
}) => {
  const { colors } = useTheme();
  const { isFavorite: isFavoriteFn, toggleFavorite } = useFavorites();

  const isFavorited = typeof controlledIsFavorite !== 'undefined'
    ? controlledIsFavorite
    : (itemId && itemType ? isFavoriteFn(itemId, itemType) : false);
  
  const handlePress = async () => {
    try {
      if (itemId && itemType) {
        await toggleFavorite(itemId, itemType);
        onToggle?.(!isFavorited);
      } else {
        // Controlled-only usage: just call the onToggle callback
        onToggle?.(!isFavorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 32;
      default: return 24;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface },
        size === 'large' && styles.largeContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorited ? 'heart' : 'heart-outline'}
        size={getSize()}
        color={isFavorited ? colors.error : colors.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  largeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});