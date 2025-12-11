import { ChatSession, ChatMessage, QuickReply } from '../../features/chatbot/types/chatbot.types';

export const mockChatSessions: ChatSession[] = [
  {
    id: 'session_1',
    userId: 'user_1',
    title: 'Travel Planning',
    isActive: true,
    metadata: {
      lastMessage: 'What are the best places to visit this weekend?',
      unreadCount: 0,
      tags: ['travel', 'planning'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'session_2',
    userId: 'user_1',
    title: 'Event Recommendations',
    isActive: false,
    metadata: {
      lastMessage: 'Any music events happening?',
      unreadCount: 2,
      tags: ['events', 'music'],
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    sessionId: 'session_1',
    role: 'USER',
    content: 'Hello! Can you recommend some good places to visit?',
    metadata: {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg_2',
    sessionId: 'session_1',
    role: 'ASSISTANT',
    content: 'Hi! I\'d be happy to help. Are you looking for historical sites, nature spots, or cultural experiences?',
    metadata: {
      timestamp: new Date(Date.now() - 3540000).toISOString(),
      quickReplies: ['Historical sites', 'Nature spots', 'Cultural experiences', 'Restaurants'],
    },
    createdAt: new Date(Date.now() - 3540000).toISOString(),
  },
];

export const mockQuickReplies: QuickReply[] = [
  {
    id: 'qr_1',
    text: 'Show me events',
    payload: { action: 'show_events' },
    type: 'action',
    icon: 'calendar',
  },
  {
    id: 'qr_2',
    text: 'Best restaurants',
    payload: { action: 'show_restaurants' },
    type: 'action',
    icon: 'restaurant',
  },
  {
    id: 'qr_3',
    text: 'Hotels nearby',
    payload: { action: 'show_hotels' },
    type: 'action',
    icon: 'bed',
  },
  {
    id: 'qr_4',
    text: 'Weather forecast',
    payload: { action: 'show_weather' },
    type: 'action',
    icon: 'cloud',
  },
];

export default {
  sessions: mockChatSessions,
  messages: mockChatMessages,
  quickReplies: mockQuickReplies,
};