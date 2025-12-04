import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useSocial } from '../hooks/useSocial';
import BlogCard from '../components/BlogCard';

const BlogFeedScreen: React.FC = () => {
	const { posts, loading } = useSocial();

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				renderItem={({ item }) => <BlogCard post={item} />}
				keyExtractor={(item) => item.id}
				refreshing={loading}
				onRefresh={() => {}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
		padding: 16,
	},
});

export { BlogFeedScreen };
export default BlogFeedScreen;
