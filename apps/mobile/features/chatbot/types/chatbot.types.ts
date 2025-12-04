export interface ChatMessage {
	id: string;
	text: string;
	sender: 'user' | 'bot';
	timestamp: number;
}

export interface QuickReply {
	title: string;
	payload: string;
}
