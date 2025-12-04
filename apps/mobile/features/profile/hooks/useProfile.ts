import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile, getNotificationSettings, updateNotificationSettings } from '../services/profile.api';
import type { UserProfile, NotificationSettings } from '../types/profile.types';

export const useProfile = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
	const [loading, setLoading] = useState(false);

	const loadProfile = useCallback(async () => {
		setLoading(true);
		try {
			const p = await getProfile();
			setProfile(p);
			const n = await getNotificationSettings();
			setNotificationSettings(n);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadProfile();
	}, [loadProfile]);

	const update = useCallback(async (updates: Partial<UserProfile>) => {
		setLoading(true);
		try {
			const updated = await updateProfile(updates);
			setProfile(updated);
			return updated;
		} finally {
			setLoading(false);
		}
	}, []);

	const updateNotifications = useCallback(async (updates: Partial<NotificationSettings>) => {
		setLoading(true);
		try {
			const updated = await updateNotificationSettings(updates);
			setNotificationSettings(updated);
			return updated;
		} finally {
			setLoading(false);
		}
	}, []);

	return { profile, notificationSettings, loading, loadProfile, update, updateNotifications };
};

export default useProfile;

