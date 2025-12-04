import React from 'react';
import { View, Button, Text } from 'react-native';

interface MediaUploaderProps {
	onUpload: (file: any) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUpload }) => {
	const handleUpload = () => {
		// Simulate file upload
		onUpload({ name: 'sample.jpg', type: 'image/jpeg' });
	};

	return (
		<View>
			<Button title="Upload Media" onPress={handleUpload} />
			<Text>Upload images or videos to your post.</Text>
		</View>
	);
};

export default MediaUploader;
