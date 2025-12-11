import { apiClient } from '../../../shared/services/api/client';
import { PaginatedResponse } from '../../../shared/types/api.types';
import { 
  ChatMessage, 
  ChatSession, 
  BotResponse, 
  ChatContext,
  ChatbotConfig 
} from '../types/chatbot.types';

const emptyPage = <T>(page = 1, limit = 10): PaginatedResponse<T> => ({
  data: [],
  pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
});

export const chatbotApi = {
  // Sessions
  async createSession(title?: string): Promise<ChatSession> {
    const res = await apiClient.post<ChatSession>('/chat/sessions', { title });
    return res.data!;
  },

  async getSessions(page = 1, limit = 20): Promise<PaginatedResponse<ChatSession>> {
    const res = await apiClient.get<PaginatedResponse<ChatSession>>('/chat/sessions', { 
      params: { page, limit } 
    });
    return res.data ?? emptyPage<ChatSession>(page, limit);
  },

  async getSession(sessionId: string): Promise<ChatSession> {
    const res = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
    return res.data!;
  },

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const res = await apiClient.patch<ChatSession>(`/chat/sessions/${sessionId}`, updates);
    return res.data!;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/chat/sessions/${sessionId}`);
  },

  // Messages
  async sendMessage(
    sessionId: string, 
    content: string, 
    context?: Partial<ChatContext>
  ): Promise<BotResponse> {
    const res = await apiClient.post<BotResponse>(`/chat/sessions/${sessionId}/messages`, {
      content,
      context,
    });
    return res.data!;
  },

  async getMessages(
    sessionId: string, 
    page = 1, 
    limit = 50
  ): Promise<PaginatedResponse<ChatMessage>> {
    const res = await apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/sessions/${sessionId}/messages`, 
      { params: { page, limit } }
    );
    return res.data ?? emptyPage<ChatMessage>(page, limit);
  },

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/chat/messages/${messageId}`);
  },

  async markAsRead(sessionId: string): Promise<void> {
    await apiClient.patch(`/chat/sessions/${sessionId}/read`);
  },

  // Bot Operations
  async getQuickReplies(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/chat/quick-replies');
    return res.data ?? [];
  },

  async getSuggestedActions(sessionId: string): Promise<string[]> {
    const res = await apiClient.get<string[]>(`/chat/sessions/${sessionId}/suggestions`);
    return res.data ?? [];
  },

  async getBotConfig(): Promise<ChatbotConfig> {
    const res = await apiClient.get<ChatbotConfig>('/chat/config');
    return res.data!;
  },

  async getContextualHelp(topic: string): Promise<string> {
    const res = await apiClient.get<{ help: string }>(`/chat/help/${topic}`);
    return res.data!.help;
  },

  // Analytics
  async recordFeedback(
    sessionId: string, 
    messageId: string, 
    feedback: 'helpful' | 'not-helpful' | 'neutral'
  ): Promise<void> {
    await apiClient.post(`/chat/feedback`, {
      sessionId,
      messageId,
      feedback,
    });
  },

  async getConversationAnalytics(sessionId: string): Promise<any> {
    const res = await apiClient.get(`/chat/analytics/${sessionId}`);
    return res.data!;
  },

  // WebSocket/Real-time
  async connectWebSocket(sessionId: string): Promise<WebSocket> {
    const base = (apiClient.getBaseURL && apiClient.getBaseURL()) || '';
    const wsUrl = `${(base || '').toString().replace('http', 'ws')}/chat/ws/${sessionId}`;
    return new WebSocket(wsUrl);
  },

  async disconnectWebSocket(): Promise<void> {
    // Implementation depends on your WebSocket setup
  },

  // Local fallback
  getFallbackResponse(): string {
    const fallbacks = [
      "I'm here to help! Could you rephrase your question?",
      "I didn't quite catch that. Can you provide more details?",
      "Let me help you with that. What specifically would you like to know?",
      "I'm still learning! Try asking about places to visit, events, or recommendations.",
      "Would you like help with bookings, recommendations, or something else?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};

export default chatbotApi;