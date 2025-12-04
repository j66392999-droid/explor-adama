import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Image } from 'react-native';
import type { UserProfile } from '../types/profile.types';

interface Props {
	profile: UserProfile | null;
	onSubmit: (updates: Partial<UserProfile>) => Promise<void> | void;
}

export const EditProfileForm: React.FC<Props> = ({ profile, onSubmit }) => {
	const [name, setName] = useState(profile?.name || '');
	const [phone, setPhone] = useState(profile?.phone || '');
	const [bio, setBio] = useState(profile?.bio || '');

	useEffect(() => {
		setName(profile?.name || '');
		setPhone(profile?.phone || '');
		setBio(profile?.bio || '');
	}, [profile]);

	const handleSubmit = async () => {
		await onSubmit({ name, phone, bio });
	};

	return (
		<View style={styles.container}>
			<Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/96' }} style={styles.avatar} />
			<TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
			<TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />
			<TextInput style={[styles.input, styles.textarea]} value={bio} onChangeText={setBio} placeholder="Bio" multiline />
			<Button title="Save" onPress={handleSubmit} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { padding: 16 },
	avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
	input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 8, marginBottom: 8 },
	textarea: { minHeight: 80 },
});

export default EditProfileForm;

