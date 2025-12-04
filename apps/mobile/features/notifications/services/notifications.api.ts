import { AppNotification } from '../types/notifications.types';

let notificationsStore: Record<string, AppNotification> = {
	'1': { id: '1', title: 'Welcome', body: 'Thanks for joining.', read: false, createdAt: new Date().toISOString() },
	'2': { id: '2', title: 'Update', body: 'We updated our terms.', read: false, createdAt: new Date().toISOString() },
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
	return new Promise((resolve) => setTimeout(() => resolve(Object.values(notificationsStore).sort((a, b) => b.createdAt.localeCompare(a.createdAt))), 200));
};

export const markAsRead = async (id: string): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (notificationsStore[id]) notificationsStore[id].read = true;
			resolve();
		}, 150);
	});
};

export const markAllAsRead = async (): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			Object.keys(notificationsStore).forEach((id) => (notificationsStore[id].read = true));
			resolve();
		}, 200);
	});
};

export const removeNotification = async (id: string): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			delete notificationsStore[id];
			resolve();
		}, 150);
	});
};

export const sendNotification = async (title: string, body?: string): Promise<AppNotification> => {
	const newNotif: AppNotification = {
		id: String(Date.now()),
		title,
		body,
		createdAt: new Date().toISOString(),
		read: false,
	};
	notificationsStore[newNotif.id] = newNotif;
	return new Promise((resolve) => setTimeout(() => resolve(newNotif), 200));
};

export default { fetchNotifications, markAsRead, markAllAsRead, removeNotification, sendNotification };

