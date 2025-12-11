import { ChatMessageRole } from '../../../shared/types/api.types';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  metadata?: {
    timestamp: string;
    isRead?: boolean;
    quickReplies?: string[];
    suggestedActions?: string[];
    typingIndicator?: boolean;
  };
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title?: string;
  isActive: boolean;
  metadata?: {
    context?: any;
    lastMessage?: string;
    unreadCount?: number;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface QuickReply {
  id: string;
  text: string;
  payload: any;
  type: 'text' | 'action' | 'url';
  icon?: string;
}

export interface BotResponse {
  message: string;
  quickReplies?: QuickReply[];
  suggestions?: string[];
  metadata?: {
    type: 'text' | 'card' | 'carousel' | 'list';
    items?: any[];
    actions?: any[];
    typingDuration?: number;
  };
}

export interface ChatContext {
  userId: string;
  sessionId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    language: string;
    tone: 'friendly' | 'professional' | 'casual';
  };
  history?: ChatMessage[];
}

export interface ChatbotConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
  systemPrompt: string;
  fallbackResponses: string[];
}

export interface ConversationState {
  currentSessionId?: string;
  isTyping: boolean;
  error?: string;
  isConnected: boolean;
  lastActivity: string;
}