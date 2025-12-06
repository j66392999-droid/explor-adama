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
import { useRouter } from 'expo-router';
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
import { useHome } from '../hooks/useHome';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const router = useRouter();
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

  const { onScroll, scrollEventThrottle } = useHideOnScroll();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleCategoryPress = (category: any) => {
    navigation.navigate('Category', { categoryId: category.id, categoryName: category.name });
  };

  const handlePlacePress = (place: any) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleEventPress = (event: any) => {
    navigation.navigate('EventDetail', { eventId: event.id });
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
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
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
            onPress={() => router.push('/profile')}
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
              <Image
                source={require('../../../assets/images/search.png')}
                style={styles.searchIcon}
              />
            }
            containerStyle={styles.searchInput}
          />
          <Button
            title="Search"
            onPress={handleSearch}
            style={styles.searchButton}
          />
        </View>

        {/* Categories */}
        {homeData?.categories && homeData.categories.length > 0 && (
          <CategoryGrid
            categories={homeData.categories}
            onCategoryPress={handleCategoryPress}
            style={styles.section}
          />
        )}

        {/* Personalized Feed */}
        {homeData?.personalizedRecommendations && 
         homeData.personalizedRecommendations.length > 0 && (
          <PersonalizedFeed
            recommendations={homeData.personalizedRecommendations}
            onItemPress={(item: FeedAction) => {
              if (item.itemType === 'PLACE') {
                handlePlacePress(item.item as any);
              } else if (item.itemType === 'EVENT') {
                handleEventPress(item.item as any);
              }
            }}
            style={styles.section}
          />
        )}

        {/* Trending Events */}
        {homeData?.trendingEvents && homeData.trendingEvents.length > 0 && (
          <TrendingSection
            events={homeData.trendingEvents}
            onEventPress={handleEventPress}
            style={styles.section}
          />
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
                onPress={() => navigation.navigate('Discovery')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {homeData.featuredPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={[styles.featuredCard, { backgroundColor: colors.surface }]}
                  onPress={() => handlePlacePress(place)}
                >
                  <Image
                    source={{ uri: place.images[0]?.url }}
                    style={styles.featuredImage}
                  />
                  <View style={styles.featuredContent}>
                    <Text variant="small" numberOfLines={2}>{place.name}</Text>
                    <Text style={styles.featuredDescription} numberOfLines={2}>
                      {place.description}
                    </Text>
                    <View style={styles.featuredMeta}>
                      <Text style={styles.rating}>
                        ⭐ {place.avgRating?.toFixed(1) || 'New'}
                      </Text>
                      <Text style={styles.views}>
                        👁️ {place.viewCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
  searchButton: {
    minWidth: 80,
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
  horizontalScroll: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredContent: {
    padding: 12,
  },
  featuredDescription: {
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  views: {
    fontSize: 12,
    opacity: 0.7,
  },
});