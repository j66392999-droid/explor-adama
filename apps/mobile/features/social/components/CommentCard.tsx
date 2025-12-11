import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { Comment } from '../types/social.types';
import { formatDistanceToNow } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface CommentCardProps {
  comment: Comment;
  onLikePress: (commentId: string) => void;
  onReplyPress: (commentId: string, username: string) => void;
  onUserPress: (userId: string) => void;
  onMenuPress?: (commentId: string) => void;
  isReply?: boolean;
  style?: any;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onLikePress,
  onReplyPress,
  onUserPress,
  onMenuPress,
  isReply = false,
  style,
}) => {
  const { colors } = useTheme();
  const [showReplies, setShowReplies] = useState(false);

  const handleLikePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLikePress(comment.id);
  };

  const handleReplyPress = () => {
    onReplyPress(comment.id, comment.user.name);
  };

  const handleUserPress = () => {
    onUserPress(comment.userId);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <View style={[styles.container, isReply && styles.replyContainer, style]}>
      {/* User info */}
      <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
        <Image
          source={{ uri: comment.user.avatar || 'https://via.placeholder.com/32' }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>{comment.user.name}</Text>
          <Text style={styles.time}>{formatDistanceToNow(comment.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      {/* Comment content */}
      <Text style={styles.content}>{comment.content}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <Ionicons
            name={comment.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={comment.isLiked ? colors.error : colors.textSecondary}
          />
          <Text style={styles.actionText}>{comment.likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReplyPress}>
          <Ionicons name="arrow-undo" size={16} color={colors.textSecondary} />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        {onMenuPress && (
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => onMenuPress(comment.id)}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Replies */}
      {comment.replyCount > 0 && (
        <TouchableOpacity style={styles.repliesButton} onPress={toggleReplies}>
          <Ionicons
            name={showReplies ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.primary}
          />
          <Text style={styles.repliesText}>
            {showReplies ? 'Hide' : 'View'} {comment.replyCount} replies
          </Text>
        </TouchableOpacity>
      )}

      {/* Nested replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onLikePress={onLikePress}
              onReplyPress={onReplyPress}
              onUserPress={onUserPress}
              onMenuPress={onMenuPress}
              isReply={true}
              style={styles.nestedReply}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  replyContainer: {
    paddingLeft: 40,
    borderBottomWidth: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    opacity: 0.7,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  repliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  repliesText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 12,
  },
  nestedReply: {
    marginTop: 8,
  },
});