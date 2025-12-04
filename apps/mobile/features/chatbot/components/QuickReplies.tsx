import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { QuickReply } from '../types/chatbot.types';

interface QuickRepliesProps {
	replies: QuickReply[];
	onReply: (payload: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onReply }) => (
	<View style={styles.container}>
		{replies.map((reply) => (
			<Button
				key={reply.payload}
				title={reply.title}
				onPress={() => onReply(reply.payload)}
			/>
		))}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginVertical: 8,
	},
});

export default QuickReplies;
