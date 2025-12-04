import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface Props {
  rating: number;
  size?: number;
  showRating?: boolean;
}

export const RatingStars: React.FC<Props> = ({ rating = 0, size = 16, showRating = false }) => {
  const { colors } = useTheme();
  const rounded = Math.round(rating * 10) / 10;
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <View style={styles.container}>
      <RNText style={{ color: '#FFD700', fontSize: size }}>{stars}</RNText>
      {showRating && (
        <RNText style={[styles.ratingText, { color: colors.text }]}>{rounded.toFixed(1)}</RNText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
  },
});
