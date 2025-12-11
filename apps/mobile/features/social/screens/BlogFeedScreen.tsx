import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { BlogCard } from '../components/BlogCard';
import { useSocial } from '../hooks/useSocial';
import { useSocialAnalytics } from '../hooks/useSocial';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { BlogPost } from '../types/social.types';
import * as Haptics from 'expo-haptics';

type BlogFeedScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BlogFeed'>;

export const BlogFeedScreen: React.FC = () => {
  const navigation = useNavigation<BlogFeedScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const {
    feed,
    feedPagination,
    trendingPosts,
    suggestedUsers,
    loadFeed,
    refreshFeed,
    loadMoreFeed,
    toggleLike,
    toggleBookmark,
    hasFeed,
    isLoading,
  } = useSocial();

  const { recordPostView, recordPostInteraction } = useSocialAnalytics();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'following'>('feed');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  }, [refreshFeed]);

  const handleLoadMore = useCallback(() => {
    if (feedPagination.hasNext && !feedPagination.isLoading) {
      loadMoreFeed();
    }
  }, [feedPagination, loadMoreFeed]);

  const handlePostPress = useCallback((post: BlogPost) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordPostView(post.id, post.title);
    navigation.navigate('PostDetail', { postId: post.id });
  }, [navigation, recordPostView]);

  const handleLikePress = useCallback(async (postId: string) => {
    const result = await toggleLike(postId);
    if (result) {
      recordPostInteraction(postId, 'like');
    }
  }, [toggleLike, recordPostInteraction]);

  const handleBookmarkPress = useCallback(async (postId: string) => {
    await toggleBookmark(postId);
    recordPostInteraction(postId, 'bookmark');
  }, [toggleBookmark, recordPostInteraction]);

  const handleCommentPress = useCallback((postId: string) => {
    navigation.navigate('PostDetail', { 
      postId,
      focusComments: true,
    });
    recordPostInteraction(postId, 'comment');
  }, [navigation, recordPostInteraction]);

  const handleSharePress = useCallback((postId: string) => {
    recordPostInteraction(postId, 'share');
  }, [recordPostInteraction]);

  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserProfile', { userId });
  }, [navigation]);

  const handleCreatePost = useCallback(() => {
    navigation.navigate('CreatePost');
  }, [navigation]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery, type: 'posts' });
    }
  }, [navigation, searchQuery]);

  const renderPost = useCallback(({ item }: { item: BlogPost }) => (
    <BlogCard
      post={item}
      onPress={handlePostPress}
      onLikePress={handleLikePress}
      onBookmarkPress={handleBookmarkPress}
      onCommentPress={handleCommentPress}
      onSharePress={handleSharePress}
      onUserPress={handleUserPress}
    />
  ), [
    handlePostPress,
    handleLikePress,
    handleBookmarkPress,
    handleCommentPress,
    handleSharePress,
    handleUserPress,
  ]);

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View>
        <Text variant="h4">Community</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Discover stories from travelers
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={handleCreatePost}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['feed', 'trending', 'following'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab && [styles.activeTabText, { color: colors.primary }],
          ]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No posts yet"
      message="Be the first to share your travel experiences!"
      icon="📝"
      action={{
        label: 'Create Post',
        onPress: handleCreatePost,
      }}
    />
  );

  if (isLoading && !hasFeed) {
    return <Loading message="Loading feed..." />;
  }

  const dataToShow = activeTab === 'trending' ? trendingPosts : feed;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search posts, users, or tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => navigation.navigate('FilterModal')}
        >
          <Ionicons name="filter" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {renderTabs()}

      <FlatList
        data={dataToShow}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          suggestedUsers.length > 0 ? (
            <View style={styles.suggestedSection}>
              <Text style={styles.sectionTitle}>Suggested Users</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedScroll}
              >
                {suggestedUsers.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.suggestedUser, { backgroundColor: colors.surface }]}
                    onPress={() => handleUserPress(user.id)}
                  >
                    <Image
                      source={{ uri: user.avatar || 'https://via.placeholder.com/60' }}
                      style={styles.suggestedAvatar}
                    />
                    <Text style={styles.suggestedName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.suggestedFollowers}>
                      {user.followerCount.toLocaleString()} followers
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null
        }
        ListFooterComponent={
          feedPagination.isLoading ? (
            <Loading size="small" message="Loading more..." />
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreatePost}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  activeTabText: {
    opacity: 1,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  suggestedSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestedScroll: {
    gap: 12,
  },
  suggestedUser: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  suggestedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestedFollowers: {
    fontSize: 12,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});