// store/slices/chat/chat.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatSession, ConversationState } from '../../../features/chatbot/types/chatbot.types';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId?: string;
  conversationState: ConversationState;
}

const initialState: ChatState = {
  sessions: [],
  conversationState: {
    isTyping: false,
    isConnected: false,
    lastActivity: new Date().toISOString(),
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessions: (state, action: PayloadAction<ChatSession[]>) => {
      state.sessions = action.payload;
    },
    setCurrentSession: (state, action: PayloadAction<string>) => {
      state.currentSessionId = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.conversationState.isTyping = action.payload;
    },
    setConnection: (state, action: PayloadAction<boolean>) => {
      state.conversationState.isConnected = action.payload;
    },
    updateLastActivity: (state) => {
      state.conversationState.lastActivity = new Date().toISOString();
    },
    clearChat: (state) => {
      state.sessions = [];
      state.currentSessionId = undefined;
    },
  },
});

export const {
  setSessions,
  setCurrentSession,
  setTyping,
  setConnection,
  updateLastActivity,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;