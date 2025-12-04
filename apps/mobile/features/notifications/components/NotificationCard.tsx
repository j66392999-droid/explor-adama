import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppNotification } from '../types/notifications.types';

interface Props {
	notification: AppNotification;
	onPress?: (n: AppNotification) => void;
	onMarkRead?: (id: string) => void;
	onRemove?: (id: string) => void;
}

const NotificationCard: React.FC<Props> = ({ notification, onPress, onMarkRead, onRemove }) => {
	return (
		<TouchableOpacity style={[styles.container, notification.read ? styles.read : styles.unread]} onPress={() => onPress?.(notification)}>
			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={styles.title}>{notification.title}</Text>
					<Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
				</View>
				{notification.body ? <Text style={styles.body}>{notification.body}</Text> : null}
			</View>
			<View style={styles.actions}>
				{!notification.read && (
					<TouchableOpacity onPress={() => onMarkRead?.(notification.id)} style={styles.actionBtn}>
						<Text style={styles.actionText}>Mark read</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity onPress={() => onRemove?.(notification.id)} style={styles.actionBtn}>
					<Text style={[styles.actionText, styles.remove]}>Remove</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e5e5e5',
		backgroundColor: '#fff',
		marginBottom: 8,
	},
	unread: {
		backgroundColor: '#F2F9FF',
	},
	read: {
		backgroundColor: '#fff',
	},
	content: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	title: {
		fontWeight: 'bold',
	},
	date: {
		fontSize: 12,
		color: '#888',
	},
	body: {
		marginTop: 8,
		color: '#333',
	},
	actions: {
		justifyContent: 'space-between',
		marginLeft: 12,
		alignSelf: 'center',
	},
	actionBtn: {
		padding: 4,
	},
	actionText: {
		color: '#007AFF',
	},
	remove: {
		color: '#FF3B30',
	},
});

export default NotificationCard;

