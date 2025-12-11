/**import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui/Typography/Text';
import { useProfile } from '../hooks/useProfile';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

type NotificationSettings = {
	push: boolean;
	email: boolean;
	sms: boolean;
};

const NotificationSettingsScreen: React.FC = () => {
	const { notificationSettings, loading, updateNotifications } = useProfile();
	const { colors } = useTheme();

	if (loading && !notificationSettings) return <Loading />;

	const toggle = (key: keyof NotificationSettings) => async (value: boolean) => {
		await updateNotifications({ [key]: value } as any);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<View style={styles.row}>
				<Text variant="body">Push Notifications</Text>
				<Switch value={notificationSettings?.push} onValueChange={toggle('push')} />
			</View>
			<View style={styles.row}>
				<Text variant="body">Email Notifications</Text>
				<Switch value={notificationSettings?.email} onValueChange={toggle('email')} />
			</View>
			<View style={styles.row}>
				<Text variant="body">SMS Notifications</Text>
				<Switch value={notificationSettings?.sms} onValueChange={toggle('sms')} />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export { NotificationSettingsScreen };
export default NotificationSettingsScreen;
**/
