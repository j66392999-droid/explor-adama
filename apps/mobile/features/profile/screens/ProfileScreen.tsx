import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { ProfileHeader } from '../components/ProfileHeader';
import { BlogCard } from '../../social/components/BlogCard';
import { useProfile } from '../hooks/useProfile';
import { useSocial } from '../../social/hooks/useSocial';
import { useSocialAnalytics } from '../../social/hooks/useSocial';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { BlogPost } from '../../social/types/social.types';
import * as Haptics from 'expo-haptics';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { userId } = route.params || {};
  
  const {
    profile,
    stats,
    isOwnProfile,
    refreshProfile,
    isLoading,
  } = useProfile(userId);

  const { feed, toggleLike, toggleBookmark } = useSocial();
  const { recordPostView, recordPostInteraction } = useSocialAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'reposts' | 'media' | 'likes'>('posts');
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = [
    { id: 'posts', title: 'Posts', icon: 'document-text' },
    { id: 'replies', title: 'Replies', icon: 'chatbubble' },
    { id: 'reposts', title: 'Reposts', icon: 'repeat' },
    { id: 'media', title: 'Media', icon: 'image' },
    { id: 'likes', title: 'Likes', icon: 'heart' },
  ] as const;

  // Animated header effects
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [60, 50],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handlePostPress = (post: BlogPost) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordPostView(post.id, post.title);
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const handleLikePress = async (postId: string) => {
    const result = await toggleLike(postId);
    if (result) {
      recordPostInteraction(postId, 'like');
    }
  };

  const handleBookmarkPress = async (postId: string) => {
    await toggleBookmark(postId);
    recordPostInteraction(postId, 'bookmark');
  };

  const handleCommentPress = (postId: string) => {
    navigation.navigate('PostDetail', { 
      postId,
      focusComments: true,
    });
    recordPostInteraction(postId, 'comment');
  };

  const handleSharePress = (postId: string) => {
    recordPostInteraction(postId, 'share');
  };

  const handleUserPress = (userId: string) => {
    if (userId !== profile?.id) {
      navigation.push('UserProfile', { userId });
    }
  };

  const handleEditPress = () => {
    navigation.navigate('EditProfile');
  };

  const handleFollowPress = () => {
    // Implement follow functionality
    console.log('Follow pressed');
  };

  const handleMessagePress = () => {
    navigation.navigate('Chat', { userId: profile?.id });
  };

  const handleMorePress = () => {
    // Show more options
    console.log('More pressed');
  };

  const handleAvatarPress = () => {
    if (isOwnProfile) {
      // Show avatar options
      console.log('Avatar pressed');
    }
  };

  const handleCoverPress = () => {
    if (isOwnProfile) {
      // Show cover options
      console.log('Cover pressed');
    }
  };

  const handleTabPress = (tabId: typeof tabs[number]['id']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header, 
        { 
          paddingTop: insets.top,
          height: headerHeight,
          backgroundColor: colors.background,
          opacity: headerOpacity,
        }
      ]}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Animated.View style={[styles.headerTitle, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {profile?.name || 'Profile'}
          </Text>
          {profile?.username && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              @{profile.username}
            </Text>
          )}
        </Animated.View>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={handleMorePress}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderProfileHeader = () => {
    if (!profile || !stats) return null;

    return (
      <ProfileHeader
        profile={profile}
        stats={{
          posts: stats?.totalPosts || 0,
          followers: stats?.totalFollowers || 0,
          following: stats?.totalFollowing || 0,
        }}
        isOwnProfile={isOwnProfile}
        onEditPress={handleEditPress}
        onFollowPress={handleFollowPress}
        onMessagePress={handleMessagePress}
        onMorePress={handleMorePress}
        onAvatarPress={handleAvatarPress}
        onCoverPress={handleCoverPress}
      />
    );
  };

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && [styles.activeTab, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? colors.primary : colors.textSecondary}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && [styles.activeTabText, { color: colors.primary }],
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="info" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {isOwnProfile ? 'Share your first post' : 'No posts yet'}
      </Text>
      <Text style={styles.emptyDescription}>
        {isOwnProfile 
          ? 'Start sharing your thoughts and experiences with the community.'
          : 'When this user posts, you\'ll see them here.'
        }
      </Text>
      {isOwnProfile && (
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPosts = () => {
    // Filter posts by active tab
    const userPosts = feed.filter(post => post.authorId === profile?.id);
    
    if (userPosts.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.postsContainer}>
        {userPosts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            onPress={handlePostPress}
            onLikePress={handleLikePress}
            onBookmarkPress={handleBookmarkPress}
            onCommentPress={handleCommentPress}
            onSharePress={handleSharePress}
            onUserPress={handleUserPress}
            variant="compact"
            style={styles.postCard}
          />
        ))}
      </View>
    );
  };

  if (isLoading && !profile) {
    return <Loading message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <ErrorState
        message="Profile not found"
        onRetry={refreshProfile}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderProfileHeader()}
        {renderTabs()}
        {renderPosts()}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  moreButton: {
    padding: 8,
  },
  scrollContent: {
    paddingTop: 60, // Header height
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabIcon: {
    marginRight: 6,
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
  postsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  postCard: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});