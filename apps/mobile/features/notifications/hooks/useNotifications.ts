// features/notifications/hooks/useNotifications.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAppSelector } from '../../../shared/hooks/state/useAppSelector';
import { notificationsApi } from '../services/notifications.api';
import { Notification, NotificationGroup, NotificationFilter } from '../types/notifications.types';
import { logger } from '../../../shared/utils/logging/logger';

export const useNotifications = () => {
  const { user } = useAppSelector(state => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<NotificationFilter, number>>({
    all: 0,
    mentions: 0,
    likes: 0,
    replies: 0,
    follows: 0,
    bookings: 0,
    payments: 0,
    events: 0,
    unread: 0,
  });
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  // Load notifications
  const loadNotifications = useCallback(async (
    filter = activeFilter,
    page = 1,
    limit = 20
  ): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { notifications: newNotifications, groups: newGroups } = 
        await notificationsApi.getNotifications(page, limit, filter);
      
      if (page === 1) {
        setNotifications(newNotifications);
        setGroups(newGroups);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
        setGroups(prev => [...prev, ...newGroups]);
      }
      
      logger.info('Notifications loaded', { 
        count: newNotifications.length, 
        filter,
        groups: newGroups.length 
      });
    } catch (error: any) {
      logger.error('Failed to load notifications', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user, activeFilter]);

  // Load unread counts
  const loadUnreadCounts = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const counts = await notificationsApi.getUnreadCount();
      setUnreadCounts(counts);
      logger.debug('Unread counts loaded', counts);
    } catch (error) {
      logger.error('Failed to load unread counts', error);
    }
  }, [user]);

  // Mark as read
  const markAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      await notificationsApi.markAsRead(id);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      
      setGroups(prev => prev.map(g => 
        g.id === id ? { ...g, read: true } : g
      ));
      
      // Update unread counts
      await loadUnreadCounts();
      
      logger.info('Notification marked as read', { id });
    } catch (error) {
      logger.error('Failed to mark as read', error);
    }
  }, [loadUnreadCounts]);

  // Mark all as read
  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Update all notifications as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setGroups(prev => prev.map(g => ({ ...g, read: true })));
      
      // Reset unread counts
      setUnreadCounts({
        all: 0,
        mentions: 0,
        likes: 0,
        replies: 0,
        follows: 0,
        bookings: 0,
        payments: 0,
        events: 0,
        unread: 0,
      });
      
      Alert.alert('Success', 'All notifications marked as read');
      logger.info('All notifications marked as read');
    } catch (error) {
      logger.error('Failed to mark all as read', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
      await notificationsApi.deleteNotification(id);
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== id));
      setGroups(prev => prev.filter(g => g.id !== id));
      
      logger.info('Notification deleted', { id });
    } catch (error) {
      logger.error('Failed to delete notification', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  }, []);

  // Filter notifications
  const filterNotifications = useCallback((filter: NotificationFilter): void => {
    setActiveFilter(filter);
    loadNotifications(filter, 1, 20);
  }, [loadNotifications]);

  // Get grouped notifications (X-style groups)
  const getGroupedNotifications = useCallback((): NotificationGroup[] => {
    return groups;
  }, [groups]);

  // Get timeline notifications (mixed groups and singles)
  const getTimeline = useCallback(() => {
    const timeline = [...groups];
    
    // Add single notifications that aren't in groups
    notifications.forEach(notification => {
      if (!timeline.some(item => item.id === notification.id)) {
        const target = notification.target
          ? {
              type: notification.target.type,
              id: notification.target.id,
              preview: notification.target.preview ?? '',
            }
          : undefined;

        timeline.push({
          id: notification.id,
          type: notification.type,
          actors: [notification.actor],
          count: 1,
          content: notification.content,
          target,
          read: notification.read,
          timestamp: notification.createdAt,
          createdAt: notification.createdAt,
        });
      }
    });
    
    // Sort by timestamp (newest first)
    return timeline.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [notifications, groups]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCounts();
      
      // Refresh every 30 seconds (like X)
      const interval = setInterval(() => {
        loadUnreadCounts();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications, loadUnreadCounts]);

  return {
    // State
    notifications,
    groups,
    timeline: getTimeline(),
    unreadCounts,
    activeFilter,
    isLoading,
    
    // Actions
    loadNotifications,
    loadUnreadCounts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filterNotifications,
    getGroupedNotifications,
    
    // Derived state
    hasUnread: unreadCounts.all > 0,
    totalCount: notifications.length + groups.length,
  };
};