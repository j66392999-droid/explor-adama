import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { QuickReply } from '../types/chatbot.types';
import { Ionicons } from '@expo/vector-icons';

interface QuickRepliesProps {
  replies: QuickReply[];
  onPress: (reply: QuickReply) => void;
  title?: string;
  maxVisible?: number;
  style?: any;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onPress,
  title = 'Quick replies',
  maxVisible = 5,
  style,
}) => {
  const { colors } = useTheme();

  if (!replies || replies.length === 0) {
    return null;
  }

  const visibleReplies = replies.slice(0, maxVisible);

  const getIcon = (type: string) => {
    switch (type) {
      case 'action':
        return 'flash';
      case 'url':
        return 'link';
      default:
        return 'chatbubble';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleReplies.map((reply) => (
          <TouchableOpacity
            key={reply.id}
            style={[
              styles.replyButton,
              { backgroundColor: colors.surfaceVariant },
            ]}
            onPress={() => onPress(reply)}
            activeOpacity={0.8}
          >
            {reply.icon && (
              <Ionicons
                name={reply.icon as any}
                size={16}
                color={colors.primary}
                style={styles.icon}
              />
            )}
            <Text style={styles.replyText} numberOfLines={1}>
              {reply.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 40,
  },
  icon: {
    marginRight: 6,
  },
  replyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});