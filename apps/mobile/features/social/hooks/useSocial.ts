import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/state/useAppSelector';
import { socialApi } from '../services/social.api';
import {
  BlogPost,
  UserProfile,
  Comment,
  Collection,
  Notification,
  CreatePostData,
  FeedFilters,
  SocialStats,
} from '../types/social.types';
import { PaginatedResponse } from '../../../shared/types/api.types';
import { logger } from '../../../shared/utils/logging/logger';
import { setLoading, setError } from '../../../store/slices/app/app.slice';
import * as ImagePicker from 'expo-image-picker';

export const useSocial = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isConnected } = useAppSelector(state => state.app);

  // State
  const [feed, setFeed] = useState<BlogPost[]>([]);
  const [feedPagination, setFeedPagination] = useState({
    page: 1,
    hasNext: true,
    isLoading: false,
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [trendingPosts, setTrendingPosts] = useState<BlogPost[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);

  // Feed management
  const loadFeed = useCallback(async (
    page = 1,
    limit = 20,
    filters?: FeedFilters
  ): Promise<PaginatedResponse<BlogPost>> => {
    if (!isConnected || !user) {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }

    try {
      setFeedPagination(prev => ({ ...prev, isLoading: true }));
      const response = await socialApi.getFeed(page, limit, filters);

      if (page === 1) {
        setFeed(response.data);
      } else {
        setFeed(prev => [...prev, ...response.data]);
      }

      setFeedPagination({
        page: response.pagination.page,
        hasNext: response.pagination.hasNext,
        isLoading: false,
      });

      logger.debug('Feed loaded', {
        count: response.data.length,
        page: response.pagination.page,
        total: response.pagination.total,
      });

      return response;
    } catch (error: any) {
      logger.error('Failed to load feed', error);
      setFeedPagination(prev => ({ ...prev, isLoading: false }));
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  }, [user, isConnected]);

  const refreshFeed = useCallback(async (filters?: FeedFilters): Promise<void> => {
    await loadFeed(1, 20, filters);
  }, [loadFeed]);

  const loadMoreFeed = useCallback(async (): Promise<void> => {
    if (!feedPagination.hasNext || feedPagination.isLoading) return;
    
    const nextPage = feedPagination.page + 1;
    await loadFeed(nextPage);
  }, [feedPagination, loadFeed]);

  // Post management
  const createPost = useCallback(async (postData: CreatePostData): Promise<BlogPost | null> => {
    if (!user) return null;

    try {
      dispatch(setLoading(true));
      const post = await socialApi.createPost(postData);
      
      // Add to feed
      setFeed(prev => [post, ...prev]);
      
      // Update stats
      if (socialStats) {
        setSocialStats({
          ...socialStats,
          totalPosts: socialStats.totalPosts + 1,
        });
      }

      logger.info('Post created', { postId: post.id });
      return post;
    } catch (error: any) {
      logger.error('Failed to create post', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, socialStats, dispatch]);

  const updatePost = useCallback(async (postId: string, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
    try {
      const post = await socialApi.updatePost(postId, updates);
      
      // Update in feed
      setFeed(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
      
      logger.info('Post updated', { postId });
      return post;
    } catch (error: any) {
      logger.error('Failed to update post', error);
      return null;
    }
  }, []);

  const deletePost = useCallback(async (postId: string): Promise<void> => {
    try {
      await socialApi.deletePost(postId);
      
      // Remove from feed
      setFeed(prev => prev.filter(p => p.id !== postId));
      
      // Update stats
      if (socialStats) {
        setSocialStats({
          ...socialStats,
          totalPosts: Math.max(0, socialStats.totalPosts - 1),
        });
      }

      logger.info('Post deleted', { postId });
    } catch (error: any) {
      logger.error('Failed to delete post', error);
    }
  }, [socialStats]);

  // Like/Unlike
  const toggleLike = useCallback(async (postId: string): Promise<{ liked: boolean; likeCount: number } | null> => {
    if (!user) return null;

    try {
      const post = feed.find(p => p.id === postId);
      const isLiked = post?.isLiked;
      
      let result;
      if (isLiked) {
        result = await socialApi.unlikePost(postId);
      } else {
        result = await socialApi.likePost(postId);
      }

      // Update in feed
      setFeed(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              isLiked: result.liked, 
              likeCount: result.likeCount,
              updatedAt: new Date().toISOString(),
            } 
          : p
      ));

      logger.debug('Post like toggled', { postId, liked: result.liked });
      return result;
    } catch (error: any) {
      logger.error('Failed to toggle like', error);
      return null;
    }
  }, [feed, user]);

  const toggleBookmark = useCallback(async (postId: string, collectionId?: string): Promise<void> => {
    if (!user) return;

    try {
      const post = feed.find(p => p.id === postId);
      const isBookmarked = post?.isBookmarked;
      
      if (isBookmarked) {
        await socialApi.removeBookmark(postId);
      } else {
        await socialApi.bookmarkPost(postId, collectionId);
      }

      // Update in feed
      setFeed(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, isBookmarked: !isBookmarked }
          : p
      ));

      logger.debug('Post bookmark toggled', { postId, bookmarked: !isBookmarked });
    } catch (error: any) {
      logger.error('Failed to toggle bookmark', error);
    }
  }, [feed, user]);

  // Comments
  const addComment = useCallback(async (
    postId: string, 
    content: string, 
    parentId?: string
  ): Promise<Comment | null> => {
    if (!user) return null;

    try {
      const comment = await socialApi.createComment(postId, content, parentId);
      
      // Update post comment count in feed
      setFeed(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, commentCount: p.commentCount + 1 }
          : p
      ));

      logger.info('Comment added', { postId, commentId: comment.id });
      return comment;
    } catch (error: any) {
      logger.error('Failed to add comment', error);
      return null;
    }
  }, [user]);

  // User profile
  const loadUserProfile = useCallback(async (userId?: string): Promise<UserProfile | null> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    try {
      const profile = await socialApi.getUserProfile(targetUserId);
      setUserProfile(profile);
      return profile;
    } catch (error: any) {
      logger.error('Failed to load user profile', error);
      return null;
    }
  }, [user]);

  const toggleFollow = useCallback(async (userId: string): Promise<{ following: boolean; followerCount: number } | null> => {
    if (!user) return null;

    try {
      const targetUser = suggestedUsers.find(u => u.id === userId) || userProfile;
      const isFollowing = targetUser?.isFollowing;
      
      let result;
      if (isFollowing) {
        result = await socialApi.unfollowUser(userId);
      } else {
        result = await socialApi.followUser(userId);
      }

      // Update in suggested users
      setSuggestedUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, isFollowing: result.following, followerCount: result.followerCount }
          : u
      ));

      // Update user profile if it's the current user
      if (userProfile?.id === userId) {
        setUserProfile(prev => prev ? {
          ...prev,
          isFollowing: result.following,
          followerCount: result.followerCount,
        } : null);
      }

      logger.debug('Follow toggled', { userId, following: result.following });
      return result;
    } catch (error: any) {
      logger.error('Failed to toggle follow', error);
      return null;
    }
  }, [user, suggestedUsers, userProfile]);

  // Collections
  const loadCollections = useCallback(async (): Promise<Collection[]> => {
    try {
      const collections = await socialApi.getCollections();
      setCollections(collections);
      return collections;
    } catch (error: any) {
      logger.error('Failed to load collections', error);
      return [];
    }
  }, []);

  const createCollection = useCallback(async (
    name: string, 
    description?: string, 
    isPrivate = false
  ): Promise<Collection | null> => {
    try {
      const collection = await socialApi.createCollection(name, description, isPrivate);
      setCollections(prev => [collection, ...prev]);
      return collection;
    } catch (error: any) {
      logger.error('Failed to create collection', error);
      return null;
    }
  }, []);

  // Notifications
  const loadNotifications = useCallback(async (page = 1): Promise<Notification[]> => {
    try {
      const response = await socialApi.getNotifications(page);
      if (page === 1) {
        setNotifications(response.data);
      } else {
        setNotifications(prev => [...prev, ...response.data]);
      }
      return response.data;
    } catch (error: any) {
      logger.error('Failed to load notifications', error);
      return [];
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await socialApi.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error: any) {
      logger.error('Failed to mark notification as read', error);
    }
  }, []);

  // Search
  const searchPosts = useCallback(async (query: string): Promise<BlogPost[]> => {
    try {
      const response = await socialApi.searchPosts(query, 1, 20);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to search posts', error);
      return [];
    }
  }, []);

  const searchUsers = useCallback(async (query: string): Promise<UserProfile[]> => {
    try {
      const response = await socialApi.searchUsers(query, 1, 20);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to search users', error);
      return [];
    }
  }, []);

  // Initialize
  const initializeSocial = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      dispatch(setLoading(true));
      
      // Load initial data
      await Promise.all([
        loadFeed(),
        loadUserProfile(),
        loadNotifications(),
        loadCollections(),
      ]);

      // Load additional data
      const [stats, trending, suggestions, cats, tags] = await Promise.all([
        socialApi.getSocialStats(),
        socialApi.getTrendingPosts(),
        socialApi.getSuggestedUsers(),
        socialApi.getCategories(),
        socialApi.getPopularTags(),
      ]);

      setSocialStats(stats);
      setTrendingPosts(trending);
      setSuggestedUsers(suggestions);
      setCategories(cats);
      setPopularTags(tags);

      logger.info('Social feature initialized');
    } catch (error: any) {
      logger.error('Failed to initialize social feature', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, loadFeed, loadUserProfile, loadNotifications, loadCollections]);

  // Media picker
  const pickMedia = useCallback(async (options?: {
    mediaTypes?: ImagePicker.MediaTypeOptions;
    allowsMultipleSelection?: boolean;
    quality?: number;
  }): Promise<{ uri: string; type: 'image' | 'video' }[]> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options?.mediaTypes || ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: options?.allowsMultipleSelection || true,
        quality: options?.quality || 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        return result.assets.map(asset => {
          const rawType = asset.type ?? (asset.uri.includes('.mp4') ? 'video' : 'image');
          const type: 'image' | 'video' = (rawType === 'video' || rawType === 'pairedVideo') ? 'video' : 'image';
          return {
            uri: asset.uri,
            type,
          };
        });
      }

      return [];
    } catch (error: any) {
      logger.error('Failed to pick media', error);
      return [];
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<{ uri: string; type: 'image' } | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          type: 'image',
        };
      }

      return null;
    } catch (error: any) {
      logger.error('Failed to take photo', error);
      return null;
    }
  }, []);

  // Cleanup
  const clearSocialData = useCallback((): void => {
    setFeed([]);
    setUserProfile(null);
    setNotifications([]);
    setCollections([]);
    setSocialStats(null);
    setTrendingPosts([]);
    setSuggestedUsers([]);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeSocial();
    }

    return () => {
      clearSocialData();
    };
  }, [user, initializeSocial]);

  return {
    // Data
    feed,
    userProfile,
    notifications,
    collections,
    socialStats,
    trendingPosts,
    suggestedUsers,
    categories,
    popularTags,
    feedPagination,

    // Actions
    loadFeed,
    refreshFeed,
    loadMoreFeed,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    toggleBookmark,
    addComment,
    loadUserProfile,
    toggleFollow,
    loadCollections,
    createCollection,
    loadNotifications,
    markNotificationAsRead,
    searchPosts,
    searchUsers,
    pickMedia,
    takePhoto,

    // Helpers
    initializeSocial,
    clearSocialData,

    // Derived states
    hasFeed: feed.length > 0,
    hasNotifications: notifications.length > 0,
    hasCollections: collections.length > 0,
    isLoading: feedPagination.isLoading,
  };
};

// Hook for social analytics
export const useSocialAnalytics = () => {
  const recordPostView = useCallback((postId: string, postTitle: string): void => {
    logger.info('Post viewed', {
      postId,
      postTitle,
      timestamp: Date.now(),
    });
  }, []);

  const recordPostInteraction = useCallback((
    postId: string,
    interactionType: 'like' | 'comment' | 'share' | 'bookmark'
  ): void => {
    logger.info(`Post ${interactionType}`, {
      postId,
      interactionType,
      timestamp: Date.now(),
    });
  }, []);

  const recordUserFollow = useCallback((userId: string, isFollowing: boolean): void => {
    logger.info(isFollowing ? 'User followed' : 'User unfollowed', {
      userId,
      timestamp: Date.now(),
    });
  }, []);

  const recordPostCreated = useCallback((postId: string, postType: string): void => {
    logger.info('Post created', {
      postId,
      postType,
      timestamp: Date.now(),
    });
  }, []);

  return {
    recordPostView,
    recordPostInteraction,
    recordUserFollow,
    recordPostCreated,
  };
};