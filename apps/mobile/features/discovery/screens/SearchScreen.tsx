import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { Text } from '../../../components/ui/Typography/Text';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { PlaceCard } from '../components/PlaceCard';
import { EventCard } from '../components/EventCard';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type SearchScreenProps = {
  route: RouteProp<{ params: { query?: string } }, 'params'>;
  navigation: any;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({
  route,
  navigation,
}) => {
  const { query: initialQuery } = route.params || {};
  const { colors } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000] as [number, number],
    rating: 0,
    sortBy: 'relevance' as 'relevance' | 'distance' | 'rating' | 'price' | 'name',
  });

  const {
    searchResults,
    isLoading,
    searchPlacesAndEvents,
    clearResults,
  } = useDiscovery();

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      clearResults();
      return;
    }

    Keyboard.dismiss();
    await searchPlacesAndEvents(query, filters);
  };

  const handleFilterApply = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilterVisible(false);
    
    if (searchQuery.trim()) {
      searchPlacesAndEvents(searchQuery, newFilters);
    }
  };

  const results = useMemo(() => {
    if (!searchResults) return [];
    
    return [...searchResults.places, ...searchResults.events].sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return ((b as any).avgRating || 0) - ((a as any).avgRating || 0);
        case 'price':
          return ((a as any).price || 0) - ((b as any).price || 0);
        case 'name':
          return ((a as any).name || (a as any).title).localeCompare(
            (b as any).name || (b as any).title
          );
        default:
          return 0;
      }
    });
  }, [searchResults, filters.sortBy]);

  const renderItem = ({ item }: { item: any }) => {
    const isPlace = 'name' in item;
    
    if (isPlace) {
      return (
        <PlaceCard
          place={item}
          onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
          style={styles.card}
        />
      );
    } else {
      return (
        <EventCard
          event={item}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          style={styles.card}
        />
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search places, events, restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            leftIcon={
              <Image
                source={require('../../../../assets/images/icons/search.png')}
                style={styles.searchIcon}
              />
            }
            containerStyle={styles.searchInput}
          />
          
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface }]}
            onPress={() => setFilterVisible(true)}
          >
            <Image
              source={require('../../../../assets/images/icons/filter.png')}
              style={styles.filterIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <Loading />
      ) : searchQuery.trim() && results.length === 0 ? (
        <EmptyState
          title="No results found"
          message="Try adjusting your search or filters"
          icon="search"
        />
      ) : searchQuery.trim() ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => (item as any).id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text variant="h3">
                {results.length} results for "{searchQuery}"
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.initialState}>
          <Image
            source={require('../../../../assets/images/icons/search.png')}
            style={styles.initialIllustration}
          />
          <Text variant="h3" style={styles.initialTitle}>
            Find Amazing Places
          </Text>
          <Text style={styles.initialText}>
            Search for places, events, restaurants, and more to discover what's around you.
          </Text>
        </View>
      )}

      {/* Filter Panel */}
      <FilterPanel
        visible={isFilterVisible}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  initialIllustration: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  initialTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  initialText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});