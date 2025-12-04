import { useCallback, useEffect, useState } from 'react';
import { AppNotification } from '../types/notifications.types';
import * as api from '../services/notifications.api';

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<AppNotification[]>([]);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		const data = await api.fetchNotifications();
		setNotifications(data);
		setLoading(false);
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const markRead = useCallback(async (id: string) => {
		setLoading(true);
		await api.markAsRead(id);
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
		setLoading(false);
	}, []);

	const markAllRead = useCallback(async () => {
		setLoading(true);
		await api.markAllAsRead();
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
		setLoading(false);
	}, []);

	const remove = useCallback(async (id: string) => {
		setLoading(true);
		await api.removeNotification(id);
		setNotifications((prev) => prev.filter((n) => n.id !== id));
		setLoading(false);
	}, []);

	const send = useCallback(async (title: string, body?: string) => {
		setLoading(true);
		const newN = await api.sendNotification(title, body);
		setNotifications((prev) => [newN, ...prev]);
		setLoading(false);
		return newN;
	}, []);

	return { notifications, loading, load, markRead, markAllRead, remove, send };
};

export default useNotifications;

