import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import {useFavorites} from '../hooks/useFavorites';

const CreateCollectionScreen: React.FC = ({ navigation }: any) => {
	const favorites = useFavorites();
	const addCollection = (favorites as any).addCollection as ((name: string, description?: string) => Promise<void>) | undefined;
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const handleCreate = async () => {
		if (!name.trim()) return;
		if (typeof addCollection !== 'function') {
			console.warn('addCollection is not available on useFavorites');
			return;
		}
		await addCollection(name.trim(), description.trim());
		navigation?.goBack();
	};

	return (
		<View style={styles.container}>
			<TextInput value={name} onChangeText={setName} placeholder="Collection name" style={styles.input} />
			<TextInput value={description} onChangeText={setDescription} placeholder="Description (optional)" style={[styles.input, styles.textarea]} multiline />
			<Button title="Create" onPress={handleCreate} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 8,
		borderRadius: 4,
		marginBottom: 12,
	},
	textarea: {
		height: 100,
	},
});

export { CreateCollectionScreen };
export default CreateCollectionScreen;

