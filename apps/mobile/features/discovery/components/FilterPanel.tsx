import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DiscoveryFilter } from '../types/discovery.types';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface FilterPanelProps {
  filters: DiscoveryFilter;
  onApplyFilters: (filters: DiscoveryFilter) => void;
  onReset: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onApplyFilters,
  onReset,
  isVisible,
  onClose,
}) => {
  const { colors, spacing } = useTheme();
  const [localFilters, setLocalFilters] = useState<DiscoveryFilter>(filters);

  const categories = [
    { id: '1', name: 'Restaurants' },
    { id: '2', name: 'Cafes' },
    { id: '3', name: 'Museums' },
    { id: '4', name: 'Parks' },
    { id: '5', name: 'Shopping' },
    { id: '6', name: 'Hotels' },
    { id: '7', name: 'Beaches' },
    { id: '8', name: 'Mountains' },
  ];

  const priceRanges = [
    { label: 'Any', value: undefined },
    { label: '$', value: { min: 0, max: 10 } },
    { label: '$$', value: { min: 11, max: 30 } },
    { label: '$$$', value: { min: 31, max: 60 } },
    { label: '$$$$', value: { min: 61, max: 100 } },
  ];

  const ratings = [1, 2, 3, 4, 5];
  const distances = [1, 5, 10, 25, 50];

  const toggleCategory = (categoryId: string) => {
    setLocalFilters(prev => {
      const currentCategories = prev.categoryIds || [];
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter(id => id !== categoryId)
        : [...currentCategories, categoryId];
      
      return {
        ...prev,
        categoryIds: newCategories.length > 0 ? newCategories : undefined,
      };
    });
  };

  const setPriceRange = (range?: { min: number; max: number }) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: range,
    }));
  };

  const setRating = (rating: number) => {
    setLocalFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? undefined : rating,
    }));
  };

  const setDistance = (distance: number) => {
    setLocalFilters(prev => ({
      ...prev,
      distance: prev.distance === distance ? undefined : distance,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: DiscoveryFilter = {};
    setLocalFilters(resetFilters);
    onReset();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: colors.background },
        ]}>
          <View style={styles.header}>
            <Text variant="body" style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: localFilters.categoryIds?.includes(category.id)
                          ? colors.primary
                          : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={[
                      styles.categoryText,
                      {
                        color: localFilters.categoryIds?.includes(category.id)
                          ? 'white'
                          : colors.text,
                      },
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceContainer}>
                {priceRanges.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceButton,
                      {
                        backgroundColor: localFilters.priceRange?.min === range.value?.min
                          ? colors.primary
                          : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setPriceRange(range.value)}
                  >
                    <Text style={[
                      styles.priceText,
                      {
                        color: localFilters.priceRange?.min === range.value?.min
                          ? 'white'
                          : colors.text,
                      },
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minimum Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {ratings.map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      {
                        backgroundColor: localFilters.rating === rating
                          ? colors.primary
                          : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setRating(rating)}
                  >
                    <Text style={[
                      styles.ratingText,
                      {
                        color: localFilters.rating === rating
                          ? 'white'
                          : colors.text,
                      },
                    ]}>
                      {rating}+ ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Maximum Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
              <View style={styles.distanceContainer}>
                {distances.map(distance => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceButton,
                      {
                        backgroundColor: localFilters.distance === distance
                          ? colors.primary
                          : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setDistance(distance)}
                  >
                    <Text style={[
                      styles.distanceText,
                      {
                        color: localFilters.distance === distance
                          ? 'white'
                          : colors.text,
                      },
                    ]}>
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Range - Optional */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range (Optional)</Text>
              <View style={styles.dateContainer}>
                <Input
                  placeholder="Start date"
                  value={localFilters.dateRange?.start.toLocaleDateString()}
                  editable={false}
                  style={styles.dateInput}
                />
                <Input
                  placeholder="End date"
                  value={localFilters.dateRange?.end.toLocaleDateString()}
                  editable={false}
                  style={styles.dateInput}
                />
              </View>
              <Text style={styles.dateNote}>
                Date filtering applies to events only
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
  },
  distanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateNote: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});