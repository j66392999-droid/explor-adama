import React from 'react';
import { View, FlatList, StyleSheet, Button, Text } from 'react-native';
import useNotifications from '../hooks/useNotifications';
import NotificationCard from '../components/NotificationCard';

const NotificationsScreen: React.FC = () => {
	const { notifications, loading, markRead, markAllRead, remove, send } = useNotifications();

	const sendTest = async () => {
		await send('Test notification', 'This is a test notification.');
	};

	return (
		<View style={styles.container}>
			<View style={styles.actionsRow}>
				<Button title="Mark all read" onPress={markAllRead} disabled={loading} />
				<Button title="Send test" onPress={sendTest} disabled={loading} />
			</View>
			{!notifications.length && !loading ? (
				<View style={styles.empty}>
					<Text>No notifications</Text>
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<NotificationCard
							notification={item}
							onMarkRead={markRead}
							onRemove={remove}
							onPress={() => markRead(item.id)}
						/>
					)}
					refreshing={loading}
					onRefresh={() => {}}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	empty: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export { NotificationsScreen };
export default NotificationsScreen;

