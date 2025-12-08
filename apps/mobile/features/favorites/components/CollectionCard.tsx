import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Collection } from '../types/favorites.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface CollectionCardProps {
  collection: Collection;
  onPress: (collection: Collection) => void;
  onOptionsPress?: (collection: Collection) => void;
  variant?: 'default' | 'compact';
  style?: any;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onPress,
  onOptionsPress,
  variant = 'default',
  style,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    onPress(collection);
  };

  const handleOptionsPress = () => {
    onOptionsPress?.(collection);
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
        {collection.coverImage ? (
          <Image
            source={{ uri: collection.coverImage }}
            style={styles.compactImage}
            defaultSource={require('../../../assets/images/placeholder-image.png')}
          />
        ) : (
          <View style={[styles.compactPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.compactPlaceholderText, { color: colors.primary }]}>
              {collection.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.compactContent}>
          <Text numberOfLines={1} style={styles.compactTitle}>
            {collection.name}
          </Text>
          <Text style={styles.compactCount}>
            {collection.itemCount} items
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

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
        {collection.coverImage ? (
          <Image
            source={{ uri: collection.coverImage }}
            style={styles.image}
            defaultSource={require('../../../assets/images/placeholder-image.png')}
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.placeholderText, { color: colors.primary }]}>
              {collection.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        {collection.isPrivate && (
          <View style={styles.privateBadge}>
            <Text style={styles.privateBadgeText}>🔒</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="small" numberOfLines={2} style={styles.title}>
            {collection.name}
          </Text>
          
          {onOptionsPress && (
            <TouchableOpacity onPress={handleOptionsPress}>
              <Text style={styles.optionsText}>⋯</Text>
            </TouchableOpacity>
          )}
        </View>

        {collection.description && (
          <Text style={styles.description} numberOfLines={2}>
            {collection.description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.count}>
            {collection.itemCount} items
          </Text>
          <Text style={styles.date}>
            {new Date(collection.updatedAt).toLocaleDateString()}
          </Text>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
  },
  placeholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  compactImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  compactPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  privateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  privateBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  content: {
    padding: 12,
  },
  compactContent: {
    flex: 1,
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
  optionsText: {
    fontSize: 20,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 18,
  },
  compactCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
});