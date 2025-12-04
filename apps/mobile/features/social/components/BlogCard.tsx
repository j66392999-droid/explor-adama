import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Post } from '../types/social.types';

interface BlogCardProps {
	post: Post;
	onPress?: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onPress }) => (
	<View style={styles.card}>
		<Text style={styles.author}>{post.author}</Text>
		<Text style={styles.content}>{post.content}</Text>
		<Text style={styles.date}>{post.createdAt}</Text>
		<Text style={styles.likes}>Likes: {post.likes}</Text>
	</View>
);

const styles = StyleSheet.create({
	card: {
		padding: 16,
		borderRadius: 8,
		backgroundColor: '#fff',
		marginBottom: 12,
		elevation: 2,
	},
	author: {
		fontWeight: 'bold',
		marginBottom: 4,
	},
	content: {
		marginBottom: 8,
	},
	date: {
		fontSize: 12,
		color: '#888',
		marginBottom: 4,
	},
	likes: {
		fontSize: 12,
		color: '#888',
	},
});

export default BlogCard;
