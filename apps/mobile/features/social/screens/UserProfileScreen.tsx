import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../../../store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { BlogCard } from '../components/BlogCard';
import { useSocial } from '../hooks/useSocial';
import { useSocialAnalytics } from '../hooks/useSocial';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { UserProfile, BlogPost } from '../types/social.types';
import * as Haptics from 'expo-haptics';

type UserProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;
type UserProfileScreenRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute<UserProfileScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { userId } = route.params;
  const { user: currentUser } = useAppSelector(state => state.auth);
  
  const {
    userProfile,
    feed,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    loadUserProfile,
    
  } = useSocial();
  
  const { recordUserFollow } = useSocialAnalytics();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'collections'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const profileData = await loadUserProfile(userId);
      if (profileData) {
        setProfile(profileData);
        // Load user's posts
        // const posts = await getUserPosts(userId);
        // setUserPosts(posts);
      } else {
        throw new Error('User not found');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowPress = async () => {
    if (!profile) return;
    
    const result = await toggleFollow(profile.id);
    if (result) {
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: result.following,
        followerCount: result.followerCount,
      } : null);
      recordUserFollow(profile.id, result.following);
    }
  };

  const handleMessagePress = () => {
    // Navigate to chat
    navigation.navigate('Chat');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handlePostPress = useCallback((post: BlogPost) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PostDetail', { postId: post.id });
  }, [navigation]);

  const handleLikePress = useCallback(async (postId: string) => {
    await toggleLike(postId);
  }, [toggleLike]);

  const handleBookmarkPress = useCallback(async (postId: string) => {
    await toggleBookmark(postId);
  }, [toggleBookmark]);

  const handleCommentPress = useCallback((postId: string) => {
    navigation.navigate('PostDetail', { 
      postId,
      focusComments: true,
    });
  }, [navigation]);

  const handleSharePress = useCallback((postId: string) => {
    // Share functionality
  }, []);

  const handleUserPress = useCallback((userId: string) => {
    if (userId !== profile?.id) {
      navigation.push('UserProfile', { userId });
    }
  }, [navigation, profile]);

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Profile</Text>
      
      <TouchableOpacity>
        <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderProfileInfo = () => {
    if (!profile) return null;

    return (
      <View style={styles.profileInfo}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profile.postCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => navigation.navigate('Followers', { userId: profile.id })}
            >
              <Text style={styles.statNumber}>{profile.followerCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => navigation.navigate('Following', { userId: profile.id })}
            >
              <Text style={styles.statNumber}>{profile.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileDetails}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {profile.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}
        </View>

        <View style={styles.actions}>
          {isOwnProfile ? (
            <>
              <Button
                title="Edit Profile"
                variant="outline"
                onPress={handleEditProfile}
                style={styles.actionButton}
              />
              <Button
                title="Share Profile"
                variant="outline"
                onPress={() => {/* Share functionality */}}
                style={styles.actionButton}
              />
            </>
          ) : (
            <>
              <Button
                title={profile.isFollowing ? 'Following' : 'Follow'}
                variant={profile.isFollowing ? 'outline' : 'primary'}
                onPress={handleFollowPress}
                style={styles.actionButton}
              />
              <Button
                title="Message"
                variant="outline"
                onPress={handleMessagePress}
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['posts', 'about', 'collections'] as const).map((tab) => (
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

  const renderContent = () => {
    if (activeTab === 'about') {
      return (
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          {profile?.bio ? (
            <Text style={styles.aboutText}>{profile.bio}</Text>
          ) : (
            <Text style={styles.emptyText}>
              {isOwnProfile ? 'Add a bio to your profile' : 'No bio available'}
            </Text>
          )}
        </View>
      );
    }

    if (activeTab === 'collections') {
      return (
        <View style={styles.collectionsSection}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <Text style={styles.emptyText}>
            {isOwnProfile ? 'Create collections to organize your saved posts' : 'No collections available'}
          </Text>
        </View>
      );
    }

    // Posts tab
    return (
      <View style={styles.postsSection}>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
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
          ))
        ) : (
          <View style={styles.emptyPosts}>
            <Ionicons name="document-text" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {isOwnProfile ? 'Create your first post' : 'No posts yet'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <ErrorState
        message={error || 'Profile not found'}
        onRetry={loadProfile}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileInfo()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 24,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  profileDetails: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
  aboutSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  collectionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  postsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  postCard: {
    marginBottom: 12,
  },
});