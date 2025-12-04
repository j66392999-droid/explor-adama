import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface ChatInputProps {
	onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
	const [message, setMessage] = useState('');

	const handleSend = () => {
		if (message.trim()) {
			onSend(message);
			setMessage('');
		}
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={message}
				onChangeText={setMessage}
				placeholder="Type a message..."
			/>
			<Button title="Send" onPress={handleSend} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
	},
});

export default ChatInput;
