import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface Props {
  place: any;
  onPress?: (place: any) => void;
  style?: any;
}

export const PlaceCard: React.FC<Props> = ({ place, onPress, style }) => {
  const { colors } = useTheme();

  const handlePress = () => onPress?.(place);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: place?.images?.[0]?.url }} style={styles.image} />
      <View style={styles.content}>
        <Text variant="small" numberOfLines={2} style={styles.title}>{place?.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{place?.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    width: 220,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    opacity: 0.75,
    fontSize: 13,
  },
});
