import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { QuickReply } from '../types/chatbot.types';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onQuickReplyPress?: (reply: QuickReply) => void;
  quickReplies?: QuickReply[];
  placeholder?: string;
  disabled?: boolean;
  isTyping?: boolean;
  style?: any;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onQuickReplyPress,
  quickReplies = [],
  placeholder = 'Type your message...',
  disabled = false,
  isTyping = false,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const [message, setMessage] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (Platform.OS !== 'web') {
        Keyboard.dismiss();
      }
    }
  };

  const handleQuickReplyPress = (reply: QuickReply) => {
    onQuickReplyPress?.(reply);
    setMessage('');
  };

  const handleAttachmentPress = () => {
    // Implement attachment functionality
    console.log('Attachment pressed');
  };

  const handleVoicePress = () => {
    // Implement voice input functionality
    console.log('Voice input pressed');
  };

  return (
    <View style={[styles.container, style]}>
      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <View style={styles.quickRepliesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesScroll}
          >
            {quickReplies.map((reply) => (
              <TouchableOpacity
                key={reply.id}
                style={[
                  styles.quickReplyButton,
                  { backgroundColor: colors.surfaceVariant },
                ]}
                onPress={() => handleQuickReplyPress(reply)}
                disabled={disabled}
              >
                <Text style={styles.quickReplyText}>{reply.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Area */}
      <View style={[
        styles.inputContainer,
        { backgroundColor: colors.surface },
        disabled && styles.disabled,
      ]}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={handleAttachmentPress}
          disabled={disabled}
        >
          <Ionicons
            name="attach"
            size={24}
            color={disabled ? colors.textTertiary : colors.textSecondary}
          />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surfaceVariant,
            },
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          editable={!disabled}
          onSubmitEditing={handleSend}
        />

        {message.trim() ? (
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              disabled && styles.disabledButton,
            ]}
            onPress={handleSend}
            disabled={disabled}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleVoicePress}
            disabled={disabled}
          >
            <Ionicons
              name="mic"
              size={24}
              color={disabled ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>
            Bot is typing...
          </Text>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: colors.textSecondary,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  quickRepliesContainer: {
    marginBottom: 12,
  },
  quickRepliesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  typingText: {
    fontSize: 12,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
    opacity: 0.6,
  },
});