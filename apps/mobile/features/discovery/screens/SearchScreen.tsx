import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { PlaceCard } from '../components/PlaceCard';
import { EventCard } from '../components/EventCard';
import { FilterPanel } from '../components/FilterPanel';
import { useDiscovery } from '../hooks/useDiscovery';
import { useDiscoveryAnalytics } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;
type SearchScreenRouteProp = RouteProp<RootStackParamList, 'Search'>;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  const { colors } = useTheme();
  
  const { search, searchResults, isLoading, error, refresh, applyFilters, clearSearch } = useDiscovery();
  const { recordScreenView, recordItemClick } = useDiscoveryAnalytics();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'events'>('all');
  const initialQuery = route.params?.query || '';

  useEffect(() => {
    recordScreenView('search');
    
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (query: string) => {
    search({ query });
  };

  const handlePlacePress = (place: any) => {
    recordItemClick(place.id, 'PLACE', 'search');
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleEventPress = (event: any) => {
    recordItemClick(event.id, 'EVENT', 'search');
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleFilterApply = (filters: any) => {
    applyFilters(filters);
  };

  const filteredPlaces = searchResults.places;
  const filteredEvents = searchResults.events;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if ('title' in item) {
      return (
        <EventCard
          event={item}
          onPress={handleEventPress}
          style={styles.card}
        />
      );
    } else {
      return (
        <PlaceCard
          place={item}
          onPress={handlePlacePress}
          style={styles.card}
        />
      );
    }
  };

  const renderContent = () => {
    if (isLoading && !searchResults.total) {
      return <Loading message="Searching..." />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={refresh} />;
    }

    if (searchResults.total === 0) {
      return (
        <EmptyState
          title="No results found"
          message="Try a different search term or adjust your filters"
          icon="🔍"
        />
      );
    }

    const combinedItems = [...filteredPlaces, ...filteredEvents];

    return (
      <FlatList
        data={combinedItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${'id' in item ? item.id : index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && searchResults.total > 0}
            onRefresh={refresh}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.total} results found
            </Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for places or events..."
          autoFocus={!initialQuery}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'all' && { color: colors.primary, fontWeight: '600' },
          ]}>
            All ({searchResults.total})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'places' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('places')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'places' && { color: colors.primary, fontWeight: '600' },
          ]}>
            Places ({filteredPlaces.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'events' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'events' && { color: colors.primary, fontWeight: '600' },
          ]}>
            Events ({filteredEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'all' && renderContent()}
        {activeTab === 'places' && (
          <FlatList
            data={filteredPlaces}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                onPress={handlePlacePress}
                style={styles.card}
              />
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && filteredPlaces.length > 0}
                onRefresh={refresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No places found"
                message="Try adjusting your search or filters"
                icon="🏛️"
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
        {activeTab === 'events' && (
          <FlatList
            data={filteredEvents}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPress={handleEventPress}
                style={styles.card}
              />
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && filteredEvents.length > 0}
                onRefresh={refresh}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No events found"
                message="Try adjusting your search or filters"
                icon="🎪"
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <FilterPanel
        filters={{}}
        onApplyFilters={handleFilterApply}
        onReset={clearSearch}
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});