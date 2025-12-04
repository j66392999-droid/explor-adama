import React, { useMemo, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

export interface CommentCardProps {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  text: string;
  createdAt?: string;
  initialLiked?: boolean;
  onLike?: (id: string, liked: boolean) => void;
  style?: any;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  id,
  authorName,
  authorAvatar,
  text,
  createdAt,
  initialLiked = false,
  onLike,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const [liked, setLiked] = useState<boolean>(initialLiked);

  const timeLabel = useMemo(() => {
    if (!createdAt) return '';
    try {
      const d = new Date(createdAt);
      return d.toLocaleString();
    } catch {
      return createdAt;
    }
  }, [createdAt]);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    onLike?.(id, next);
  };

  return (
    <View style={[styles.container, { borderColor: colors.border, padding: spacing.md }, style]}>
      <Image
        source={{ uri: authorAvatar || 'https://via.placeholder.com/48' }}
        style={[styles.avatar, { borderRadius: 999 }]}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="label" style={{ marginRight: 8 }}>{authorName}</Text>
          <Text variant="caption" style={{ color: colors.textSecondary }}>{timeLabel}</Text>
        </View>

        <Text variant="body" style={{ marginTop: 6 }}>{text}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Text variant="caption" style={{ color: liked ? colors.primary : colors.textSecondary }}>
              {liked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default CommentCard;
