import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { CommentCard } from '../components/CommentCard';
import { useSocial } from '../hooks/useSocial';
import { useSocialAnalytics } from '../hooks/useSocial';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { BlogPost, Comment } from '../types/social.types';
import { formatDistanceToNow } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

type PostDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PostDetail'>;
type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailScreenNavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { postId, focusComments } = route.params;
  
  const {
    feed,
    toggleLike,
    toggleBookmark,
    addComment,
    loadUserProfile,
  } = useSocial();
  
  const { recordPostView, recordPostInteraction } = useSocialAnalytics();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
    recordPostView(postId, post?.title || 'Unknown');
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Find post in feed or fetch from API
      const foundPost = feed.find(p => p.id === postId);
      
      if (foundPost) {
        setPost(foundPost);
        // Simulate loading comments
        await loadComments(foundPost.id);
      } else {
        // If not in feed, fetch from API
        // const fetchedPost = await socialApi.getPost(postId);
        // setPost(fetchedPost);
        // await loadComments(fetchedPost.id);
        throw new Error('Post not found');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    // Simulate loading comments
    // const response = await socialApi.getComments(postId);
    // setComments(response.data);
    setComments([]); // Placeholder
  };

  const handleLikePress = async () => {
    if (!post) return;
    
    const result = await toggleLike(post.id);
    if (result) {
      setPost(prev => prev ? {
        ...prev,
        isLiked: result.liked,
        likeCount: result.likeCount,
      } : null);
      recordPostInteraction(post.id, 'like');
    }
  };

  const handleBookmarkPress = async () => {
    if (!post) return;
    
    await toggleBookmark(post.id);
    setPost(prev => prev ? {
      ...prev,
      isBookmarked: !prev.isBookmarked,
    } : null);
    recordPostInteraction(post.id, 'bookmark');
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      await Share.share({
        message: `Check out this post: ${post.title}\n\n${post.excerpt}`,
        url: `app://post/${post.id}`,
      });
      recordPostInteraction(post.id, 'share');
    } catch (error) {
      console.error('Failed to share post', error);
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handleCommentLikePress = async (commentId: string) => {
    // Implement comment like functionality
    console.log('Like comment:', commentId);
  };

  const handleReplyPress = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;

    try {
      const comment = await addComment(post.id, newComment, replyingTo?.id);
      
      if (comment) {
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setReplyingTo(null);
        setPost(prev => prev ? {
          ...prev,
          commentCount: prev.commentCount + 1,
        } : null);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const renderMedia = () => {
    if (!post || post.media.length === 0) return null;

    const media = post.media[0];
    
    return (
      <View style={styles.mediaContainer}>
        {media.type === 'VIDEO' ? (
          <View style={styles.videoContainer}>
            <Image source={{ uri: media.thumbnail || media.url }} style={styles.media} />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={48} color="white" />
            </View>
          </View>
        ) : (
          <Image source={{ uri: media.url }} style={styles.media} />
        )}
        
        {post.media.length > 1 && (
          <View style={styles.mediaCountBadge}>
            <Text style={styles.mediaCountText}>+{post.media.length - 1}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTags = () => {
    if (!post || !post.tags || post.tags.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        {post.tags.map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return <Loading message="Loading post..." />;
  }

  if (error || !post) {
    return (
      <ErrorState
        message={error || 'Post not found'}
        onRetry={loadPost}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <View style={styles.content}>
          {/* Author */}
          <TouchableOpacity 
            style={styles.authorContainer}
            onPress={() => handleUserPress(post.authorId)}
          >
            <Image
              source={{ uri: post.author.avatar || 'https://via.placeholder.com/48' }}
              style={styles.authorAvatar}
            />
            <View>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.postTime}>
                {formatDistanceToNow(post.createdAt)} • {post.viewCount.toLocaleString()} views
              </Text>
            </View>
          </TouchableOpacity>

          {/* Title & Content */}
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.body}>{post.content}</Text>

          {/* Media */}
          {renderMedia()}

          {/* Tags */}
          {renderTags()}

          {/* Stats */}
          <View style={styles.stats}>
            <Text style={styles.statText}>
              {post.likeCount.toLocaleString()} likes
            </Text>
            <Text style={styles.statText}>
              {post.commentCount.toLocaleString()} comments
            </Text>
            <Text style={styles.statText}>
              {post.shareCount.toLocaleString()} shares
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
              <Ionicons
                name={post.isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={post.isLiked ? colors.error : colors.text}
              />
              <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                Like
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                // Focus comment input
                // You might want to scroll to comment section
              }}
            >
              <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleBookmarkPress}>
              <Ionicons
                name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={post.isBookmarked ? colors.primary : colors.text}
              />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({post.commentCount})
          </Text>

          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            {replyingTo && (
              <View style={styles.replyingTo}>
                <Text style={styles.replyingToText}>
                  Replying to @{replyingTo.username}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.commentInputRow}>
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                style={styles.commentInput}
              />
              <Button
                title="Post"
                onPress={handleSubmitComment}
                disabled={!newComment.trim()}
                size="small"
              />
            </View>
          </View>

          {/* Comments List */}
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onLikePress={handleCommentLikePress}
                onReplyPress={handleReplyPress}
                onUserPress={handleUserPress}
              />
            ))
          ) : (
            <View style={styles.noComments}>
              <Ionicons name="chatbubble" size={48} color={colors.textSecondary} />
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubtext}>
                Be the first to share your thoughts!
              </Text>
            </View>
          )}
        </View>
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
  moreButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  media: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mediaCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    opacity: 0.8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statText: {
    fontSize: 14,
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
  },
  likedText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  commentInputContainer: {
    marginBottom: 24,
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    color: '#007AFF',
    fontSize: 14,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    marginBottom: 0,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  noCommentsSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});