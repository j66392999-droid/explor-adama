import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Post } from '../types/social.types';
import CommentCard from '../components/CommentCard';

interface PostDetailScreenProps {
	post: Post;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ post }) => (
	<View style={styles.container}>
		<Text style={styles.author}>{post.author}</Text>
		<Text style={styles.content}>{post.content}</Text>
		<FlatList
			data={post.comments}
			renderItem={({ item }) => <CommentCard {...item} />}
			keyExtractor={(item) => item.id}
		/>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	author: {
		fontWeight: 'bold',
		marginBottom: 8,
	},
	content: {
		marginBottom: 16,
	},
});

export { PostDetailScreen };
export default PostDetailScreen;
