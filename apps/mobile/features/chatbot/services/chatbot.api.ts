import { ChatMessage } from '../types/chatbot.types';

export const sendMessageToBot = async (message: string): Promise<ChatMessage> => {
	// Simulate API call
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				id: String(Date.now()),
				text: `Bot reply to: ${message}`,
				sender: 'bot',
				timestamp: Date.now(),
			});
		}, 500);
	});
};
