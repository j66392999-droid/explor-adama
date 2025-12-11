// features/notifications/services/notifications.api.ts
import { apiClient } from '../../../shared/services/api/client';
import { Notification, NotificationGroup, NotificationFilter } from '../types/notifications.types';

export const notificationsApi = {
  /**
   * GET /api/notifications - Get notifications feed (X-style)
   */
  async getNotifications(
    page = 1,
    limit = 20,
    filter?: NotificationFilter
  ): Promise<{ notifications: Notification[]; groups: NotificationGroup[] }> {
    const params: any = { page, limit };
    if (filter && filter !== 'all') params.filter = filter;
    
    const res = await apiClient.get<{ notifications: Notification[]; groups: NotificationGroup[] }>(
      '/notifications',
      { params }
    );
    return res.data!;
  },

  /**
   * GET /api/notifications/unread/count - Get unread counts
   */
  async getUnreadCount(): Promise<Record<NotificationFilter, number>> {
    const res = await apiClient.get<Record<NotificationFilter, number>>('/notifications/unread/count');
    return res.data!;
  },

  /**
   * POST /api/notifications/:id/read - Mark as read
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  /**
   * POST /api/notifications/read/all - Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read/all');
  },

  /**
   * DELETE /api/notifications/:id - Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * POST /api/notifications/preferences - Update preferences
   */
  async updatePreferences(preferences: any): Promise<void> {
    await apiClient.post('/notifications/preferences', preferences);
  },

  /**
   * GET /api/notifications/preferences - Get preferences
   */
  async getPreferences(): Promise<any> {
    const res = await apiClient.get('/notifications/preferences');
    return res.data!;
  },

  /**
   * POST /api/notifications/:id/interact - Interact with notification
   */
  async interact(id: string, action: 'like' | 'reply' | 'retweet'): Promise<void> {
    await apiClient.post(`/notifications/${id}/interact`, { action });
  },
};