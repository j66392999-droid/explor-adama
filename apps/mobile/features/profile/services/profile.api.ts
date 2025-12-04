import { UserProfile, NotificationSettings } from '../types/profile.types';

let profileStore: UserProfile = {
	id: 'user-1',
	name: 'John Doe',
	email: 'johndoe@example.com',
	phone: '+1234567890',
	avatar: 'https://via.placeholder.com/96',
	bio: 'Explorer of places',
	locale: 'en',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

let notificationSettingsStore: NotificationSettings = {
	push: true,
	email: true,
	sms: false,
};

export const getProfile = async (): Promise<UserProfile> => {
	return new Promise((resolve) => setTimeout(() => resolve(profileStore), 150));
};

export const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
	profileStore = { ...profileStore, ...updates, updatedAt: new Date().toISOString() };
	return new Promise((resolve) => setTimeout(() => resolve(profileStore), 150));
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
	return new Promise((resolve) => setTimeout(() => resolve(notificationSettingsStore), 150));
};

export const updateNotificationSettings = async (updates: Partial<NotificationSettings>): Promise<NotificationSettings> => {
	notificationSettingsStore = { ...notificationSettingsStore, ...updates };
	return new Promise((resolve) => setTimeout(() => resolve(notificationSettingsStore), 150));
};

export default { getProfile, updateProfile, getNotificationSettings, updateNotificationSettings };

