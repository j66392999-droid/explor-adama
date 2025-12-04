import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import MediaUploader from './MediaUploader';

interface CreatePostFormProps {
	onSubmit: (content: string, media?: any) => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSubmit }) => {
	const [content, setContent] = useState('');
	const [media, setMedia] = useState<any>(null);

	const handleSubmit = () => {
		onSubmit(content, media);
		setContent('');
		setMedia(null);
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={content}
				onChangeText={setContent}
				placeholder="What's on your mind?"
			/>
			<MediaUploader onUpload={setMedia} />
			<Button title="Post" onPress={handleSubmit} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		padding: 8,
		marginBottom: 8,
	},
});

export default CreatePostForm;
