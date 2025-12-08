import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { PlaceCard } from '../components/PlaceCard';
import { EventCard } from '../components/EventCard';
import { useDiscovery } from '../hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { Place, Event } from '../types/discovery.types'; // Import the actual types

type CategoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Category'>;
type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;

export const CategoryScreen: React.FC = () => {
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryId, categoryName } = route.params;
  
  const { colors } = useTheme();
  const { 
    getCategoryItems, 
    isLoading, 
    error, 
    refresh, 
    retry, 
    searchResults,
    selectedCategory 
  } = useDiscovery();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'places' | 'events'>('places');

  useEffect(() => {
    loadCategoryItems();
  }, [categoryId]);

  const loadCategoryItems = async () => {
    try {
      await getCategoryItems(categoryId);
    } catch (error) {
      console.error('Failed to load category items:', error);
    }
  };

  // Update local state when searchResults changes
  useEffect(() => {
    if (searchResults) {
      // Use type assertions since we know the structure
      const categoryPlaces = searchResults.places as Place[];
      const categoryEvents = searchResults.events as Event[];
      
      setPlaces(categoryPlaces);
      setEvents(categoryEvents);
    }
  }, [searchResults]);

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const renderContent = () => {
    if (isLoading && places.length === 0 && events.length === 0) {
      return <Loading message={`Loading ${categoryName}...`} />;
    }

    if (error && places.length === 0 && events.length === 0) {
      return <ErrorState message={error} onRetry={retry} />;
    }

    const currentItems = activeTab === 'places' ? places : events;
    const totalItems = activeTab === 'places' ? places.length : events.length;

    if (totalItems === 0) {
      return (
        <EmptyState
          title={`No ${activeTab} found`}
          message={`No ${activeTab} in ${categoryName} category yet`}
          icon={activeTab === 'places' ? '🏛️' : '🎪'}
        />
      );
    }

    if (activeTab === 'places') {
      return (
        <FlatList
          data={places}
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              onPress={() => handlePlacePress(item)}
              style={styles.card}
            />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && places.length > 0}
              onRefresh={loadCategoryItems}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      );
    }

    return (
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => handleEventPress(item)}
            style={styles.card}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && events.length > 0}
            onRefresh={loadCategoryItems}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="large" style={styles.title}>
          {selectedCategory?.name || categoryName}
        </Text>
        <Text style={styles.subtitle}>
          {activeTab === 'places' ? places.length : events.length} items
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
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
            Places ({places.length})
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
            Events ({events.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
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
});