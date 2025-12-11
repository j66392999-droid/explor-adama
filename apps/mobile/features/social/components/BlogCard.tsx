import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { BlogPost } from '../types/social.types';
import { formatDistanceToNow } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface BlogCardProps {
  post: BlogPost;
  onPress: (post: BlogPost) => void;
  onLikePress: (postId: string) => void;
  onBookmarkPress: (postId: string) => void;
  onCommentPress: (postId: string) => void;
  onSharePress: (postId: string) => void;
  onUserPress: (userId: string) => void;
  variant?: 'compact' | 'detailed';
  style?: any;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  onPress,
  onLikePress,
  onBookmarkPress,
  onCommentPress,
  onSharePress,
  onUserPress,
  variant = 'detailed',
  style,
}) => {
  const { colors, spacing } = useTheme();
  const [imageError, setImageError] = useState(false);

  const handleLikePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLikePress(post.id);
  };

  const handleBookmarkPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmarkPress(post.id);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post: ${post.title}`,
        url: `app://post/${post.id}`,
      });
      onSharePress(post.id);
    } catch (error) {
      console.error('Failed to share post', error);
    }
  };

  const handleUserPress = () => {
    onUserPress(post.authorId);
  };

  const renderMedia = () => {
    if (post.media.length === 0 || imageError) {
      return (
        <View style={[styles.placeholderMedia, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="image" size={32} color={colors.textSecondary} />
        </View>
      );
    }

    if (post.media[0].type === 'VIDEO') {
      return (
        <View style={styles.videoContainer}>
          <Image
            source={{ uri: post.media[0].thumbnail || post.media[0].url }}
            style={styles.media}
            onError={() => setImageError(true)}
          />
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={40} color="white" />
          </View>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: post.media[0].url }}
        style={styles.media}
        onError={() => setImageError(true)}
      />
    );
  };

  const renderTags = () => {
    if (!post.tags || post.tags.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        {post.tags.slice(0, 3).map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: colors.surface }, style]}
        onPress={() => onPress(post)}
        activeOpacity={0.8}
      >
        <View style={styles.compactHeader}>
          <TouchableOpacity style={styles.compactUserInfo} onPress={handleUserPress}>
            <Image
              source={{ uri: post.author.avatar || 'https://via.placeholder.com/40' }}
              style={styles.compactAvatar}
            />
            <View>
              <Text style={styles.compactUserName}>{post.author.name}</Text>
              <Text style={styles.compactTime}>{formatDistanceToNow(post.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.compactTitle} numberOfLines={2}>{post.title}</Text>
        
        {post.excerpt && (
          <Text style={styles.compactExcerpt} numberOfLines={2}>{post.excerpt}</Text>
        )}

        <View style={styles.compactActions}>
          <TouchableOpacity style={styles.compactAction} onPress={handleLikePress}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={post.isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={styles.compactActionText}>{post.likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.compactAction} onPress={() => onCommentPress(post.id)}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.compactActionText}>{post.commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.compactAction} onPress={handleBookmarkPress}>
            <Ionicons
              name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={post.isBookmarked ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
          <Image
            source={{ uri: post.author.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{post.author.name}</Text>
            {post.author.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            )}
            <Text style={styles.time}>{formatDistanceToNow(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <TouchableOpacity onPress={() => onPress(post)} activeOpacity={0.9}>
        {post.title && (
          <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        )}
        
        {post.excerpt && (
          <Text style={styles.excerpt} numberOfLines={3}>{post.excerpt}</Text>
        )}

        {/* Media */}
        {post.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {renderMedia()}
            {post.media.length > 1 && (
              <View style={styles.mediaCountBadge}>
                <Text style={styles.mediaCountText}>+{post.media.length - 1}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {renderTags()}
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statText}>
          {post.viewCount.toLocaleString()} views
        </Text>
        <Text style={styles.statText}>
          {post.likeCount.toLocaleString()} likes
        </Text>
        <Text style={styles.statText}>
          {post.commentCount.toLocaleString()} comments
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
          onPress={() => onCommentPress(post.id)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    opacity: 0.6,
  },
  moreButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.8,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  placeholderMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 8,
  },
  mediaCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    opacity: 0.8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
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
  // Compact variant
  compactContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactHeader: {
    marginBottom: 8,
  },
  compactUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  compactUserName: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactTime: {
    fontSize: 11,
    opacity: 0.6,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactExcerpt: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  compactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  compactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactActionText: {
    fontSize: 12,
    opacity: 0.7,
  },
});