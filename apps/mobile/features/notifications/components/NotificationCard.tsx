// features/notifications/components/NotificationCard.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { NotificationGroup, NOTIFICATION_TYPES } from '../types/notifications.types';
import { formatRelativeTime } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface NotificationCardProps {
  notification: NotificationGroup;
  onPress?: () => void;
  onLongPress?: () => void;
  onProfilePress?: (userId: string) => void;
  onContentPress?: (targetId: string, targetType: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onLongPress,
  onProfilePress,
  onContentPress,
}) => {
  const { colors } = useTheme();
  const typeInfo = NOTIFICATION_TYPES[notification.type];
  const isGrouped = notification.count > 1;
  const mainActor = notification.actors[0];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onProfilePress?.(mainActor.id);
  };

  const handleContentPress = () => {
    if (notification.target) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onContentPress?.(notification.target.id, notification.target.type);
    }
  };

  const renderAvatar = () => (
    <TouchableOpacity onPress={handleProfilePress} style={styles.avatarContainer}>
      {mainActor.avatar ? (
        <Image source={{ uri: mainActor.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={styles.avatarInitial}>
            {mainActor.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      
      {/* Notification type indicator */}
      <View style={[styles.typeIndicator, { backgroundColor: typeInfo.color }]}>
        <Ionicons name={typeInfo.icon as any} size={12} color="white" />
      </View>
    </TouchableOpacity>
  );

  const renderGroupedAvatars = () => (
    <View style={styles.groupedAvatars}>
      {notification.actors.slice(0, 3).map((actor, index) => (
        <TouchableOpacity 
          key={actor.id} 
          onPress={() => onProfilePress?.(actor.id)}
          style={[
            styles.groupedAvatar,
            { left: index * 15, zIndex: 3 - index }
          ]}
        >
          {actor.avatar ? (
            <Image source={{ uri: actor.avatar }} style={styles.groupedAvatarImage} />
          ) : (
            <View style={[styles.groupedAvatarPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={styles.groupedAvatarInitial}>
                {actor.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
      
      {notification.count > 3 && (
        <View style={[styles.moreBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.moreText}>+{notification.count - 3}</Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.names}>
          {isGrouped ? (
            <Text style={styles.name} numberOfLines={1}>
              {notification.actors.map(a => a.name).join(', ')}
            </Text>
          ) : (
            <>
              <Text style={styles.name} numberOfLines={1}>
                {mainActor.name}
              </Text>
              {mainActor.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
              )}
              <Text style={styles.username} numberOfLines={1}>
                @{mainActor.username}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.time}>{formatRelativeTime(notification.timestamp)}</Text>
      </View>
      
      <Text style={styles.action}>
        <Text style={{ color: typeInfo.color, fontWeight: '600' }}>
          {typeInfo.action}
        </Text>
        {isGrouped && ` and ${notification.count - 1} others`}
      </Text>
      
      <Text style={styles.message} numberOfLines={3}>
        {notification.content}
      </Text>
      
      {notification.target?.preview && (
        <TouchableOpacity 
          style={[styles.targetPreview, { borderColor: colors.border }]}
          onPress={handleContentPress}
        >
          <Text style={styles.targetText} numberOfLines={2}>
            {notification.target.preview}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
      
      <View style={styles.actionButtons}>
        {notification.type === 'LIKE' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart" size={20} color="#E0245E" />
          </TouchableOpacity>
        )}
        
        {notification.type === 'REPLY' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {notification.type === 'RETWEET' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="repeat" size={20} color="#17BF63" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: notification.read ? colors.background : `${colors.primary}08` },
        !notification.read && { borderLeftWidth: 3, borderLeftColor: colors.primary },
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.9}
      delayLongPress={500}
    >
      <View style={styles.innerContainer}>
        {isGrouped ? renderGroupedAvatars() : renderAvatar()}
        {renderContent()}
        {renderActions()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  groupedAvatars: {
    position: 'relative',
    width: 48,
    height: 48,
    marginRight: 12,
  },
  groupedAvatar: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  groupedAvatarImage: {
    width: '100%',
    height: '100%',
  },
  groupedAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupedAvatarInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  moreBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  names: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    opacity: 0.6,
    marginLeft: 4,
  },
  time: {
    fontSize: 13,
    opacity: 0.6,
  },
  action: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  targetPreview: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  targetText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 18,
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});