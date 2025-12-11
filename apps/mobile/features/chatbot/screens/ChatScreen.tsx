import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { ChatInput } from '../components/ChatInput';
import { ChatMessageComponent } from '../components/ChatMessage';
import { QuickReplies } from '../components/QuickReplies';
import { useChatbot } from '../hooks/useChatbot';
import { useChatAnalytics } from '../hooks/useChatbot';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { ChatMessage, QuickReply } from '../types/chatbot.types';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  
  const {
    currentSession,
    messages,
    quickReplies,
    conversationState,
    createSession,
    sendMessage,
    initializeChatbot,
    provideFeedback,
    clearMessages,
    getConversationSummary,
    hasMessages,
  } = useChatbot();

  const { recordMessageSent, recordQuickReplyUsed } = useChatAnalytics();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Initialize or create session on mount
  useEffect(() => {
    const initChat = async () => {
      await initializeChatbot();
      if (!currentSession) {
        await createSession();
      }
    };
    
    initChat();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (hasMessages && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    const response = await sendMessage(content);
    if (response) {
      recordMessageSent(content, currentSession?.id || '');
    }
  };

  const handleQuickReplyPress = async (reply: QuickReply) => {
    const response = await sendMessage('', reply);
    if (response) {
      recordQuickReplyUsed(reply.text, currentSession?.id || '');
    }
  };

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    provideFeedback(messageId, feedback);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initializeChatbot();
    setIsRefreshing(false);
  };

  const handleClearChat = () => {
    clearMessages();
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleSessionHistoryPress = () => {
    // Navigate to session history
    console.log('Navigate to session history');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatMessageComponent
      message={item}
      isUser={item.role === 'USER'}
      onFeedback={handleFeedback}
      onCopy={(text) => console.log('Copied:', text)}
      onShare={(text) => console.log('Shared:', text)}
    />
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text variant="small">Travel Assistant</Text>
          <Text style={styles.subtitle}>Online • Always here to help</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSessionHistoryPress}
        >
          <Ionicons name="time" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSettingsPress}
        >
          <Ionicons name="settings" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      title="Start a conversation"
      message="Ask me about places to visit, events, bookings, or anything else!"
      icon="🤖"
      action={{
        label: 'Try these examples',
        onPress: () => {
          const examples = [
            "What are the best places to visit?",
            "Show me upcoming events",
            "Help me book a tour",
            "What's the weather like?",
          ];
          // Show examples as quick replies
        },
      }}
    />
  );

  if (conversationState.error && !hasMessages) {
    return (
      <ErrorState
        message="Failed to load chat"
        onRetry={initializeChatbot}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesContainer,
          !hasMessages && styles.emptyMessagesContainer,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onContentSizeChange={() => {
          if (hasMessages) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (hasMessages) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <QuickReplies
          replies={quickReplies}
          onPress={handleQuickReplyPress}
          title="Quick replies"
          maxVisible={5}
          style={styles.quickReplies}
        />
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onQuickReplyPress={handleQuickReplyPress}
        quickReplies={quickReplies}
        disabled={!currentSession || conversationState.isTyping}
        isTyping={conversationState.isTyping}
        style={styles.chatInput}
      />

      {/* Clear Chat Button (Floating) */}
      {hasMessages && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.surface }]}
          onPress={handleClearChat}
        >
          <Ionicons name="trash" size={18} color={colors.error} />
          <Text style={[styles.clearText, { color: colors.error }]}>
            Clear Chat
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  quickReplies: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chatInput: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  clearButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});