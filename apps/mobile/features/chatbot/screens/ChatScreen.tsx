import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import QuickReplies from '../components/QuickReplies';
import { ChatMessage as Message, QuickReply } from '../types/chatbot.types';
import { useHideOnScroll } from '../../../shared/hooks/ui/useBottomTabs';

const initialMessages: Message[] = [
	{ id: '1', text: 'Hello! How can I help you?', sender: 'bot', timestamp: Date.now() },
];

const quickReplies: QuickReply[] = [
	{ title: 'Help', payload: 'help' },
	{ title: 'Contact', payload: 'contact' },
];

const ChatScreen: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>(initialMessages);

	const { onScroll, scrollEventThrottle } = useHideOnScroll();

	const handleSend = (text: string) => {
		const newMessage: Message = {
			id: String(Date.now()),
			text,
			sender: 'user',
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, newMessage]);
	};

	const handleReply = (payload: string) => {
		handleSend(payload);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={messages}
				renderItem={({ item }) => <ChatMessage message={item} />}
				keyExtractor={(item) => item.id}
				style={styles.list}
				onScroll={onScroll}
				scrollEventThrottle={scrollEventThrottle}
			/>
			<QuickReplies replies={quickReplies} onReply={handleReply} />
			<ChatInput onSend={handleSend} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	list: {
		flex: 1,
		marginBottom: 8,
	},
});

export default ChatScreen;
