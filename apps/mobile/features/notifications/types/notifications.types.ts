export interface NotificationAction {
	type: string;
	payload?: any;
}

export interface AppNotification {
	id: string;
	title: string;
	body?: string;
	read?: boolean;
	createdAt: string;
	action?: NotificationAction;
}

export type NotificationList = AppNotification[];

export default AppNotification;

