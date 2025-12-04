import React from 'react';
import { View, StyleSheet } from 'react-native';
import CreatePostForm from '../components/CreatePostForm';
import { useSocial } from '../hooks/useSocial';

const CreatePostScreen: React.FC = () => {
	const { handleCreatePost } = useSocial();

	return (
		<View style={styles.container}>
			<CreatePostForm onSubmit={handleCreatePost} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
});

export { CreatePostScreen };
export default CreatePostScreen;
