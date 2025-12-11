import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { ChatMessage as ChatMessageType } from '../types/chatbot.types';
import * as Haptics from 'expo-haptics';

interface ChatMessageProps {
  message: ChatMessageType;
  isUser?: boolean;
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not-helpful') => void;
  onCopy?: (text: string) => void;
  onShare?: (text: string) => void;
  style?: any;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  isUser = false,
  onFeedback,
  onCopy,
  onShare,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const [showFeedback, setShowFeedback] = useState(false);
  const [givenFeedback, setGivenFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFeedback(!showFeedback);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    onCopy?.(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: message.content,
      });
      onShare?.(message.content);
    } catch (error) {
      console.error('Failed to share message', error);
    }
  };

  const handleFeedback = (feedback: 'helpful' | 'not-helpful') => {
    setGivenFeedback(feedback);
    onFeedback?.(message.id, feedback);
    setTimeout(() => setShowFeedback(false), 1000);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderQuickReplies = () => {
    if (!message.metadata?.quickReplies || isUser) return null;

    return (
      <View style={styles.quickReplies}>
        {message.metadata.quickReplies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.quickReply,
              { backgroundColor: colors.surfaceVariant },
            ]}
            onPress={() => console.log('Quick reply:', reply)}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.botContainer,
        style,
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        {isUser ? (
          <Ionicons name="person" size={20} color={colors.onPrimary} />
        ) : (
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.onPrimary} />
        )}
      </View>

      {/* Message Content */}
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? colors.primary : colors.surfaceVariant,
            },
          ]}
        >
          <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.8}>
            <Text
              style={[
                styles.messageText,
                {
                  color: isUser ? colors.onPrimary : colors.text,
                },
              ]}
            >
              {message.content}
            </Text>
          </TouchableOpacity>

          {/* Time */}
          <Text
            style={[
              styles.timeText,
              {
                color: isUser ? colors.onPrimary + '80' : colors.textSecondary,
              },
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
        </View>

        {/* Quick Replies */}
        {renderQuickReplies()}

        {/* Feedback Options */}
        {showFeedback && !isUser && !givenFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>Was this helpful?</Text>
            <View style={styles.feedbackButtons}>
              <Button
                title="Yes"
                variant="ghost"
                size="small"
                onPress={() => handleFeedback('helpful')}
                leftIcon={<Ionicons name="thumbs-up" size={16} />}
              />
              <Button
                title="No"
                variant="ghost"
                size="small"
                onPress={() => handleFeedback('not-helpful')}
                leftIcon={<Ionicons name="thumbs-down" size={16} />}
              />
            </View>
          </View>
        )}

        {/* Given Feedback */}
        {givenFeedback && (
          <View style={styles.givenFeedback}>
            <Ionicons
              name={givenFeedback === 'helpful' ? 'thumbs-up' : 'thumbs-down'}
              size={16}
              color={colors.primary}
            />
            <Text style={styles.givenFeedbackText}>
              Thanks for your feedback!
            </Text>
          </View>
        )}
      </View>

      {/* Action Menu */}
      {showFeedback && (
        <View style={styles.actionMenu}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
          >
            <Ionicons name="copy" size={20} color={colors.text} />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share" size={20} color={colors.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  quickReply: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickReplyText: {
    fontSize: 14,
  },
  feedbackContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  givenFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  givenFeedbackText: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionMenu: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'absolute',
    right: 16,
    top: -40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
  },
});