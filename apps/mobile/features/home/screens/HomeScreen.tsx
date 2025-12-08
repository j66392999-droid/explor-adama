import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { PersonalizedFeed, FeedAction } from '../components/PersonalizedFeed';
import { CategoryGrid } from '../components/CategoryGrid';
import { TrendingSection } from '../components/TrendingSection';
import { PlaceCard } from '../../discovery/components/PlaceCard';
import { EventCard } from '../../discovery/components/EventCard';
import { useHome } from '../hooks/useHome';
import { useDiscovery } from '../../discovery/hooks/useDiscovery';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAppSelector((state) => state.auth);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const {
    homeData,
    isLoading,
    error,
    refetch,
    isRefreshing,
  } = useHome();

  const { nearbyPlaces, nearbyEvents, userLocation } = useDiscovery();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleCategoryPress = (category: any) => {
    navigation.navigate('Category', { 
      categoryId: category.id, 
      categoryName: category.name 
    });
  };

  const handlePlacePress = (place: any) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleEventPress = (event: any) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleMapPress = () => {
    navigation.navigate('Map');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  if (isLoading && !homeData) {
    return <Loading />;
  }

  if (error && !homeData) {
    return (
      <ErrorState
        message="Failed to load home data"
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: (insets.top || 12) }] }>
          <View>
            <Text style={styles.greeting}>Hello, {user?.profile?.name || 'Traveler'}! 👋</Text>
            <Text variant="large" style={styles.title}>
              Where do you want to explore today?
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.avatar}
            onPress={handleProfilePress}
          >
            <Image
              source={
                user?.profile?.avatar
                  ? { uri: user.profile.avatar }
                  : require('../../../assets/images/placeholder-image.png')
              }
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search places, events, restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            leftIcon={
              <Ionicons name="search" size={20} color={colors.textSecondary} />
            }
            containerStyle={styles.searchInput}
          />
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.primary }]}
            onPress={handleMapPress}
          >
            <Ionicons name="map" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        {homeData?.categories && homeData.categories.length > 0 && (
          <CategoryGrid
            categories={homeData.categories}
            onCategoryPress={handleCategoryPress}
            style={styles.section}
          />
        )}

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="small">Nearby Places</Text>
              <Button
                title="See All"
                variant="ghost"
                size="small"
                onPress={() => navigation.navigate('Search', { query: 'places' })}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {nearbyPlaces.slice(0, 5).map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onPress={() => handlePlacePress(place)}
                  variant="compact"
                  style={styles.horizontalCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending Events */}
        {homeData?.trendingEvents && homeData.trendingEvents.length > 0 && (
          <TrendingSection
            events={homeData.trendingEvents}
            onEventPress={handleEventPress}
            style={styles.section}
          />
        )}

        {/* Personalized Feed */}
        {homeData?.personalizedRecommendations && 
         homeData.personalizedRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text variant="small" style={styles.sectionTitle}>
              Recommended For You
            </Text>
            <PersonalizedFeed
              recommendations={homeData.personalizedRecommendations}
              onItemPress={(item: FeedAction) => {
                if ('itemType' in item && item.itemType === 'PLACE') {
                  handlePlacePress(item.item as any);
                } else if ('itemType' in item && item.itemType === 'EVENT') {
                  handleEventPress(item.item as any);
                }
              }}
            />
          </View>
        )}

        {/* Upcoming Events */}
        {nearbyEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="small">Upcoming Events</Text>
              <Button
                title="See All"
                variant="ghost"
                size="small"
                onPress={() => navigation.navigate('Search', { query: 'events' })}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {nearbyEvents.slice(0, 5).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event)}
                  variant="compact"
                  style={styles.horizontalCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Places */}
        {homeData?.featuredPlaces && homeData.featuredPlaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="body">Featured Places</Text>
              <Button
                title="See All"
                variant="ghost"
                size="small"
                onPress={() => navigation.navigate('Search', {})}
              />
            </View>
            <View style={styles.verticalList}>
              {homeData.featuredPlaces.slice(0, 3).map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onPress={() => handlePlacePress(place)}
                  style={styles.verticalCard}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {/*<View style={styles.quickActions}>
          <Text variant="body">Quick Actions</Text>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Search', { query: 'restaurants' })}
          >
            <Text style={styles.quickActionIcon}>🍽️</Text>
            <Text style={styles.quickActionText}>Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Search', { query: 'hotels' })}
          >
            <Text style={styles.quickActionIcon}>🏨</Text>
            <Text style={styles.quickActionText}>Stay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Search', { query: 'activities' })}
          >
            <Text style={styles.quickActionIcon}>🎭</Text>
            <Text style={styles.quickActionText}>Activities</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Search', { query: 'shopping' })}
          >
            <Text style={styles.quickActionIcon}>🛍️</Text>
            <Text style={styles.quickActionText}>Shopping</Text>
          </TouchableOpacity>
        </View>*/}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    opacity: 0.7,
    marginBottom: 4,
  },
  title: {
    marginBottom: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  horizontalCard: {
    width: 200,
    marginRight: 12,
  },
  verticalList: {
    paddingHorizontal: 20,
  },
  verticalCard: {
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickAction: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});