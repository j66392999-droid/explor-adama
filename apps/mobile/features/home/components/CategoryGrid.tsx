import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Category } from '../types/home.types';

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
  numColumns?: number;
  style?: any;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryPress,
  numColumns = 4,
  style,
}) => {
  const { colors, spacing } = useTheme();

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor: colors.surface,
          margin: spacing.xs,
        },
      ]}
      onPress={() => onCategoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.categoryIcon}>
          {getCategoryIcon(item.key)}
        </Text>
      </View>
      
      <Text
        style={[
          styles.categoryName,
          { color: colors.text },
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getCategoryIcon = (key: string): string => {
    const iconMap: Record<string, string> = {
      beach: '🏖️',
      mountain: '⛰️',
      historical: '🏛️',
      cultural: '🎭',
      religious: '🛐',
      nature: '🌳',
      adventure: '🧗',
      food: '🍴',
      shopping: '🛍️',
      entertainment: '🎪',
      hotel: '🏨',
      restaurant: '🍽️',
    };

    return iconMap[key] || '📍';
  };

  return (
    <View style={[styles.container, style]}>
      <Text variant="small" style={styles.sectionTitle}>
        Categories
      </Text>
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  grid: {
    paddingHorizontal: 4,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minHeight: 80,
    maxWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
});