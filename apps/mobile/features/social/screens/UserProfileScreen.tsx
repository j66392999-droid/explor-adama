import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface UserProfileScreenProps {
	user: {
		name: string;
		avatar?: string;
		bio?: string;
	};
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ user }) => (
	<View style={styles.container}>
		<Image
			source={{ uri: user.avatar || 'https://via.placeholder.com/96' }}
			style={styles.avatar}
		/>
		<Text style={styles.name}>{user.name}</Text>
		{user.bio && <Text style={styles.bio}>{user.bio}</Text>}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
		backgroundColor: '#fff',
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		marginBottom: 16,
	},
	name: {
		fontWeight: 'bold',
		fontSize: 20,
		marginBottom: 8,
	},
	bio: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
});

export { UserProfileScreen };
export default UserProfileScreen;
