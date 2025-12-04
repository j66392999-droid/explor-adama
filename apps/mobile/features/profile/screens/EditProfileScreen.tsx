import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EditProfileForm } from '../components/EditProfileForm';
import { useProfile } from '../hooks/useProfile';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

const EditProfileScreen: React.FC = ({ navigation }: any) => {
	const { profile, loading, update } = useProfile();
	const { colors } = useTheme();

	const handleSubmit = async (updates: any) => {
		await update(updates);
		navigation?.goBack();
	};

	if (loading && !profile) return <Loading />;

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<View style={styles.inner}> 
				<EditProfileForm profile={profile} onSubmit={handleSubmit} />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	inner: { padding: 16 },
});

export { EditProfileScreen };
export default EditProfileScreen;

