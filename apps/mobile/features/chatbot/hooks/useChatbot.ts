import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../../shared/hooks/state/useAppSelector';
import { chatbotApi } from '../services/chatbot.api';
import { 
  ChatMessage, 
  ChatSession, 
  BotResponse, 
  ChatContext,
  ConversationState,
  QuickReply 
} from '../types/chatbot.types';
import { logger } from '../../../shared/utils/logging/logger';
import { setLoading, setError } from '../../../store/slices/app/app.slice';
import { useLocation } from '../../../shared/hooks/device/useLocation';

export const useChatbot = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isConnected: isNetworkConnected } = useAppSelector(state => state.app);
  const { getCurrentLocation } = useLocation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    isTyping: false,
    isConnected: false,
    lastActivity: new Date().toISOString(),
  });
  const [botConfig, setBotConfig] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  // Initialize chatbot
  const initializeChatbot = useCallback(async (): Promise<void> => {
    if (!isNetworkConnected || !user) {
      setConversationState(prev => ({ ...prev, error: 'No internet connection or user not logged in' }));
      return;
    }

    try {
      dispatch(setLoading(true));
      
      // Load config
      const config = await chatbotApi.getBotConfig();
      setBotConfig(config);

      // Load sessions
      const sessionsResponse = await chatbotApi.getSessions();
      setSessions(sessionsResponse.data);

      // Load quick replies
      const replies = await chatbotApi.getQuickReplies();
      setQuickReplies(
        replies.map((text, index) => ({
          id: `reply_${index}`,
          text,
          payload: { text },
          type: 'text' as const,
        }))
      );

      setConversationState(prev => ({ ...prev, isConnected: true, error: undefined }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize chatbot';
      setConversationState(prev => ({ ...prev, error: errorMessage }));
      logger.error('Failed to initialize chatbot', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, isNetworkConnected, dispatch]);

  // Create new session
  const createSession = useCallback(async (title?: string): Promise<ChatSession | null> => {
    if (!user) return null;

    try {
      dispatch(setLoading(true));
      const session = await chatbotApi.createSession(title || `Chat ${new Date().toLocaleDateString()}`);
      
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      
      logger.info('New chat session created', { sessionId: session.id });
      return session;
    } catch (error: any) {
      logger.error('Failed to create chat session', error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Send message
  const sendMessage = useCallback(async (
    content: string, 
    quickReply?: QuickReply
  ): Promise<BotResponse | null> => {
    if (!currentSession || !user || !isNetworkConnected) {
      return null;
    }

    const messageContent = quickReply?.text || content;
    if (!messageContent.trim()) return null;

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        sessionId: currentSession.id,
        role: 'USER',
        content: messageContent,
        metadata: { timestamp: new Date().toISOString() },
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setConversationState(prev => ({ ...prev, isTyping: true }));

      // Get location context if available
      let locationContext;
      try {
        const location = await getCurrentLocation();
        if (location) {
          locationContext = {
            latitude: location.latitude,
            longitude: location.longitude,
          };
        }
      } catch (locationError) {
        logger.warn('Failed to get location for chatbot context', locationError);
      }

      const context: Partial<ChatContext> = {
        userId: user.id,
        location: locationContext,
        preferences: {
          language: (user.profile as any)?.locale || 'en',
          tone: 'friendly',
        },
      };

      // Send to API
      const response = await chatbotApi.sendMessage(
        currentSession.id,
        messageContent,
        context
      );

      // Add bot response
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sessionId: currentSession.id,
        role: 'ASSISTANT',
        content: response.message,
        metadata: {
          timestamp: new Date().toISOString(),
          quickReplies: response.quickReplies?.map(r => r.text),
          suggestedActions: response.suggestions,
        },
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update quick replies if provided
      if (response.quickReplies) {
        setQuickReplies(response.quickReplies);
      }

      // Update session last message
      await chatbotApi.updateSession(currentSession.id, {
        metadata: {
          ...currentSession.metadata,
          lastMessage: messageContent,
        },
      });

      return response;
    } catch (error: any) {
      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: `fallback_${Date.now()}`,
        sessionId: currentSession.id,
        role: 'ASSISTANT',
        content: chatbotApi.getFallbackResponse(),
        metadata: { timestamp: new Date().toISOString() },
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
      logger.error('Failed to send message', error);
      return null;
    } finally {
      setConversationState(prev => ({ ...prev, isTyping: false }));
    }
  }, [currentSession, user, isNetworkConnected, getCurrentLocation]);

  // Load session messages
  const loadSessionMessages = useCallback(async (
    sessionId: string,
    page = 1
  ): Promise<ChatMessage[]> => {
    if (!isNetworkConnected) return [];

    try {
      const response = await chatbotApi.getMessages(sessionId, page);
      if (page === 1) {
        setMessages(response.data);
      } else {
        setMessages(prev => [...response.data, ...prev]);
      }
      return response.data;
    } catch (error: any) {
      logger.error('Failed to load session messages', error);
      return [];
    }
  }, [isNetworkConnected]);

  // Switch session
  const switchSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const session = sessions.find(s => s.id === sessionId) || 
                     await chatbotApi.getSession(sessionId);
      
      setCurrentSession(session);
      await loadSessionMessages(sessionId);
      
      // Mark as read
      await chatbotApi.markAsRead(sessionId);
      
      // Update sessions list
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, metadata: { ...s.metadata, unreadCount: 0 } } : s
      ));
    } catch (error: any) {
      logger.error('Failed to switch session', error);
    }
  }, [sessions, loadSessionMessages]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      await chatbotApi.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error: any) {
      logger.error('Failed to delete session', error);
    }
  }, [currentSession]);

  // WebSocket connection
  const connectWebSocket = useCallback(async (sessionId: string): Promise<void> => {
    if (!isNetworkConnected || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = await chatbotApi.connectWebSocket(sessionId);
      
      wsRef.current.onopen = () => {
        setConversationState(prev => ({ ...prev, isConnected: true }));
        logger.info('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            const botMessage: ChatMessage = {
              id: data.id,
              sessionId,
              role: 'ASSISTANT',
              content: data.content,
              metadata: data.metadata,
              createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, botMessage]);
          }
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error);
        }
      };

      wsRef.current.onclose = () => {
        setConversationState(prev => ({ ...prev, isConnected: false }));
        logger.info('WebSocket disconnected');
        
        // Attempt reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (currentSession?.id) {
            connectWebSocket(currentSession.id);
          }
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        logger.error('WebSocket error', error);
      };
    } catch (error: any) {
      logger.error('Failed to connect WebSocket', error);
    }
  }, [currentSession, isNetworkConnected]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  // Provide feedback
  const provideFeedback = useCallback(async (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | 'neutral'
  ): Promise<void> => {
    if (!currentSession) return;

    try {
      await chatbotApi.recordFeedback(currentSession.id, messageId, feedback);
      logger.info('Feedback recorded', { messageId, feedback });
    } catch (error: any) {
      logger.warn('Failed to record feedback', error);
    }
  }, [currentSession]);

  // Clear messages
  const clearMessages = useCallback((): void => {
    setMessages([]);
  }, []);

  // Get conversation summary
  const getConversationSummary = useCallback((): string => {
    if (messages.length === 0) return 'No conversation yet';
    
    const userMessages = messages.filter(m => m.role === 'USER');
    const botMessages = messages.filter(m => m.role === 'ASSISTANT');
    
    return `${userMessages.length} user messages, ${botMessages.length} bot responses`;
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    // Data
    sessions,
    currentSession,
    messages,
    quickReplies,
    conversationState,
    botConfig,

    // Actions
    initializeChatbot,
    createSession,
    sendMessage,
    switchSession,
    deleteSession,
    loadSessionMessages,
    connectWebSocket,
    disconnectWebSocket,
    provideFeedback,
    clearMessages,

    // Helpers
    getConversationSummary,

    // Derived states
    hasSessions: sessions.length > 0,
    hasMessages: messages.length > 0,
    isConnected: conversationState.isConnected && isNetworkConnected,
  };
};

// Hook for chat analytics
export const useChatAnalytics = () => {
  const recordChatEvent = useCallback((event: string, metadata?: any): void => {
    logger.info(`Chat event: ${event}`, metadata);
  }, []);

  const recordMessageSent = useCallback((content: string, sessionId: string): void => {
    recordChatEvent('message_sent', {
      contentLength: content.length,
      sessionId,
      timestamp: Date.now(),
    });
  }, [recordChatEvent]);

  const recordQuickReplyUsed = useCallback((reply: string, sessionId: string): void => {
    recordChatEvent('quick_reply_used', {
      reply,
      sessionId,
      timestamp: Date.now(),
    });
  }, [recordChatEvent]);

  const recordSessionDuration = useCallback((sessionId: string, duration: number): void => {
    recordChatEvent('session_duration', {
      sessionId,
      duration,
      timestamp: Date.now(),
    });
  }, [recordChatEvent]);

  return {
    recordChatEvent,
    recordMessageSent,
    recordQuickReplyUsed,
    recordSessionDuration,
  };
};