import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { UserProfile } from '../types/profile.types';

interface Props {
	profile: UserProfile | null;
	onEdit?: () => void;
}

export const ProfileHeader: React.FC<Props> = ({ profile, onEdit }) => {
	return (
		<View style={styles.container}>
			<Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/96' }} style={styles.avatar} />
			<View style={styles.info}>
				<Text variant="h2">{profile?.name || 'User'}</Text>
				{profile?.bio ? <Text>{profile.bio}</Text> : null}
			</View>
			<View style={styles.actions}>
				<Button title="Edit" size="small" onPress={onEdit} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flexDirection: 'row', alignItems: 'center', padding: 12 },
	avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
	info: { flex: 1 },
	actions: {},
});

export default ProfileHeader;

