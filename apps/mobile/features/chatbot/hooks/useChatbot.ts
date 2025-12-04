import { useState } from 'react';
import { ChatMessage } from '../types/chatbot.types';
import { sendMessageToBot } from '../services/chatbot.api';

export const useChatbot = () => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [loading, setLoading] = useState(false);

	const sendMessage = async (text: string) => {
		setLoading(true);
		const userMessage: ChatMessage = {
			id: String(Date.now()),
			text,
			sender: 'user',
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, userMessage]);
		const botReply = await sendMessageToBot(text);
		setMessages((prev) => [...prev, botReply]);
		setLoading(false);
	};

	return { messages, sendMessage, loading };
};
