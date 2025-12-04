import React from 'react';
import { View, StyleSheet } from 'react-native';
import SettingsItem from '../components/SettingsItem';
import ThemeModeSetting from '../../../shared/components/ThemeModeSetting';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

export const SettingsScreen: React.FC = ({ navigation }: any) => {
	const { colors } = useTheme();

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<SettingsItem title="Notification settings" onPress={() => navigation?.navigate('NotificationSettings')} />
			<SettingsItem title="Privacy" onPress={() => navigation?.navigate('Privacy')} />
			<SettingsItem title="Language" onPress={() => navigation?.navigate('Language')} />
			<ThemeModeSetting />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});

export { SettingsScreen };
export default SettingsScreen;

