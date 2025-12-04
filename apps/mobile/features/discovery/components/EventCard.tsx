import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface Props {
  event: any;
  onPress?: (event: any) => void;
  style?: any;
}

export const EventCard: React.FC<Props> = ({ event, onPress, style }) => {
  const { colors } = useTheme();

  const handlePress = () => onPress?.(event);

  const imageUrl = event?.images?.[0]?.url || event?.place?.images?.[0]?.url;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text variant="small" numberOfLines={2} style={styles.title}>{event?.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{event?.description}</Text>
        <Text style={styles.meta}>{new Date(event?.date).toLocaleDateString()}</Text>
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
  meta: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7,
  },
});
