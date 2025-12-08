import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { FavoriteButton } from '../components/FavoriteButton';
import { PlaceCard } from '../../discovery/components/PlaceCard';
import { EventCard } from '../../discovery/components/EventCard';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { colors } = useTheme();
  
  const {
    favorites,
    isLoading,
    isRefreshing,
    error,
    refresh,
    removeFromFavorites,
  } = useFavorites();
  
  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'events'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handlePlacePress = useCallback((place: any) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  }, [navigation]);

  const handleEventPress = useCallback((event: any) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  }, [navigation]);

  const handleCreateCollection = useCallback(() => {
    navigation.navigate('CreateCollection');
  }, [navigation]);

  const handleCollectionsPress = useCallback(() => {
    navigation.navigate('Collections');
  }, [navigation]);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    try {
      for (const itemId of selectedItems) {
        // Find item to get its type
        const favorite = favorites.find(f => f.id === itemId);
        if (favorite) {
          await removeFromFavorites(favorite.itemId, favorite.itemType);
        }
      }
      setSelectedItems([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Failed to delete selected items', error);
    }
  }, [selectedItems, favorites, removeFromFavorites]);

  const filteredItems = {
    all: favorites,
    places: favorites.filter(item => item.itemType === 'PLACE'),
    events: favorites.filter(item => item.itemType === 'EVENT'),
  }[activeTab];

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.itemType === 'PLACE') {
      return (
        <PlaceCard
          place={item.item}
          onPress={() => handlePlacePress(item.item)}
          variant="compact"
          style={styles.card}
          onBookPress={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
        />
      );
    } else {
      return (
        <EventCard
          event={item.item}
          onPress={() => handleEventPress(item.item)}
          variant="compact"
          style={styles.card}
          onBookPress={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
        />
      );
    }
  }, [handlePlacePress, handleEventPress, isSelectionMode, toggleItemSelection]);

  if (isLoading && favorites.length === 0) {
    return <Loading message="Loading favorites..." />;
  }

  if (error && favorites.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text variant="large" style={styles.title}>Favorites</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsSelectionMode(!isSelectionMode)}
          >
            <Ionicons
              name={isSelectionMode ? 'close' : 'checkbox-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCollectionsPress}
          >
            <Ionicons
              name="folder-outline"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selection Mode Actions */}
      {isSelectionMode && selectedItems.length > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: colors.surface }]}>
          <Text style={styles.selectionCount}>
            {selectedItems.length} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={handleDeleteSelected}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.selectionButtonText, { color: colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => console.log('Add to collection')}
            >
              <Ionicons name="folder-outline" size={20} color={colors.primary} />
              <Text style={[styles.selectionButtonText, { color: colors.primary }]}>
                Add to Collection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
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
            All ({favorites.length})
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
            Places ({filteredItems.filter(item => item.itemType === 'PLACE').length})
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
            Events ({filteredItems.filter(item => item.itemType === 'EVENT').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' ? "No favorites yet" : `No ${activeTab} in favorites`}
          message={activeTab === 'all' 
            ? "Start exploring and add places or events to your favorites" 
            : `You haven't added any ${activeTab} to your favorites yet`}
          icon="❤️"
          action={activeTab === 'all' ? {
            label: 'Explore Now',
            onPress: () => navigation.navigate('Home'),
          } : undefined}
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Collection Button */}
      {!isSelectionMode && (
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateCollection}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createButtonText}>New Collection</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});