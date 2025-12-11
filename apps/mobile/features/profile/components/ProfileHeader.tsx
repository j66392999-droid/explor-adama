import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { ExtendedProfile } from '../types/profile.types';
import { formatRelativeTime, formatCompactNumber } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface ProfileHeaderProps {
  profile: ExtendedProfile;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEditPress: () => void;
  onFollowPress: () => void;
  onMessagePress: () => void;
  onMorePress: () => void;
  onAvatarPress: () => void;
  onCoverPress: () => void;
  variant?: 'default' | 'compact';
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  stats,
  isOwnProfile,
  isFollowing = false,
  onEditPress,
  onFollowPress,
  onMessagePress,
  onMorePress,
  onAvatarPress,
  onCoverPress,
  variant = 'default',
}) => {
  const { colors } = useTheme();
  const [headerScrollY] = useState(new Animated.Value(0));

  // Animated values for header effects
  const headerOpacity = headerScrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const handleFollowPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFollowPress();
  };

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEditPress();
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.stat}>
        <Text style={styles.statNumber}>{formatCompactNumber(stats.posts)}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <TouchableOpacity style={styles.stat}>
        <Text style={styles.statNumber}>{formatCompactNumber(stats.followers)}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.stat}>
        <Text style={styles.statNumber}>{formatCompactNumber(stats.following)}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBio = () => {
    if (!profile.bio) return null;

    return (
      <View style={styles.bioContainer}>
        <Text style={styles.bioText}>{profile.bio}</Text>
      </View>
    );
  };

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      {profile.location && (
        <View style={styles.infoItem}>
          <Ionicons name="location" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{profile.location}</Text>
        </View>
      )}
      
      {profile.website && (
        <TouchableOpacity style={styles.infoItem}>
          <Ionicons name="link" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            {profile.website.replace(/^https?:\/\//, '')}
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.infoItem}>
        <Ionicons name="calendar" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Joined {formatRelativeTime(profile.joinedDate)}
        </Text>
      </View>
    </View>
  );

  const renderSocialLinks = () => {
    if (!profile.socialLinks) return null;

    return (
      <View style={styles.socialLinks}>
        {profile.socialLinks.twitter && (
          <TouchableOpacity style={styles.socialLink}>
            <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
          </TouchableOpacity>
        )}
        {profile.socialLinks.instagram && (
          <TouchableOpacity style={styles.socialLink}>
            <Ionicons name="logo-instagram" size={20} color="#E1306C" />
          </TouchableOpacity>
        )}
        {profile.socialLinks.linkedin && (
          <TouchableOpacity style={styles.socialLink}>
            <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderActions = () => {
    if (variant === 'compact') {
      return (
        <View style={styles.actionsCompact}>
          {isOwnProfile ? (
            <TouchableOpacity
              style={[styles.editButtonCompact, { backgroundColor: colors.surfaceVariant }]}
              onPress={onEditPress}
            >
              <Ionicons name="pencil" size={18} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.followButtonCompact, { backgroundColor: colors.primary }]}
                onPress={handleFollowPress}
              >
                <Text style={styles.followButtonText}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.messageButtonCompact, { backgroundColor: colors.surfaceVariant }]}
                onPress={onMessagePress}
              >
                <Ionicons name="chatbubble" size={18} color={colors.text} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.moreButtonCompact, { backgroundColor: colors.surfaceVariant }]}
            onPress={onMorePress}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actions}>
        {isOwnProfile ? (
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={handleEditPress}
            style={styles.editButton}
            leftIcon={<Ionicons name="pencil" size={18} />}
          />
        ) : (
          <>
            <Button
              title={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'outline' : 'primary'}
              onPress={handleFollowPress}
              style={styles.followButton}
            />
            <Button
              title="Message"
              variant="outline"
              onPress={onMessagePress}
              style={styles.messageButton}
              leftIcon={<Ionicons name="chatbubble" size={18} />}
            />
          </>
        )}
        <TouchableOpacity
          style={[styles.moreButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={onMorePress}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  };

  if (variant === 'compact') {
    return (
      <View style={[styles.containerCompact, { backgroundColor: colors.background }]}>
        <View style={styles.headerCompact}>
          <TouchableOpacity onPress={onAvatarPress}>
            <Image
              source={{ uri: profile.avatar || 'https://via.placeholder.com/60' }}
              style={styles.avatarCompact}
            />
          </TouchableOpacity>
          
          <View style={styles.infoCompact}>
            <Text style={styles.nameCompact} numberOfLines={1}>
              {profile.name}
            </Text>
            {profile.username && (
              <Text style={styles.usernameCompact} numberOfLines={1}>
                @{profile.username}
              </Text>
            )}
          </View>
          
          {renderActions()}
        </View>
        
        {profile.bio && (
          <Text style={styles.bioCompact} numberOfLines={2}>
            {profile.bio}
          </Text>
        )}
        
        {renderStats()}
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: headerOpacity }]}>
      {/* Cover Image */}
      <TouchableOpacity onPress={onCoverPress} activeOpacity={0.9}>
        <Image
          source={{ 
            uri: profile.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba'
          }}
          style={styles.coverImage}
          defaultSource={require('../../../assets/images/placeholder-image.png')}
        />
        <View style={styles.coverOverlay} />
      </TouchableOpacity>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarContainer} onPress={onAvatarPress}>
          <Image
            source={{ uri: profile.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          {isOwnProfile && (
            <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Verification Badge */}
        {profile.isVerified && (
          <View style={[styles.verificationBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}

        {/* Name & Username */}
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
          {profile.username && (
            <Text style={styles.username} numberOfLines={1}>
              @{profile.username}
            </Text>
          )}
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Bio */}
        {renderBio()}

        {/* Info */}
        {renderInfo()}

        {/* Social Links */}
        {renderSocialLinks()}

        {/* Actions */}
        {renderActions()}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Default variant
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginTop: -50,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  verificationBadge: {
    position: 'absolute',
    top: 40,
    left: 90,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  nameContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 22,
  },
  infoContainer: {
    marginBottom: 16,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  socialLink: {
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    flex: 1,
  },
  moreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Compact variant
  containerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCompact: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoCompact: {
    flex: 1,
  },
  nameCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  usernameCompact: {
    fontSize: 14,
    opacity: 0.6,
  },
  bioCompact: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
    opacity: 0.8,
  },
  actionsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButtonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonCompact: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButtonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});