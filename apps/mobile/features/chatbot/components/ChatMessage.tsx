import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage as Message } from '../types/chatbot.types';

interface ChatMessageProps {
	message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => (
	<View style={[styles.container, message.sender === 'user' ? styles.user : styles.bot]}>
		<Text style={styles.text}>{message.text}</Text>
	</View>
);

const styles = StyleSheet.create({
	container: {
		padding: 8,
		marginVertical: 4,
		borderRadius: 8,
		maxWidth: '80%',
	},
	user: {
		alignSelf: 'flex-end',
		backgroundColor: '#DCF8C6',
	},
	bot: {
		alignSelf: 'flex-start',
		backgroundColor: '#F1F0F0',
	},
	text: {
		fontSize: 16,
	},
});

export default ChatMessage;
