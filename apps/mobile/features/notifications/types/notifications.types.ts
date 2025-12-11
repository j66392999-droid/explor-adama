// features/notifications/types/notifications.types.ts
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  target?: {
    type: 'tweet' | 'reply' | 'like' | 'retweet' | 'follow' | 'event' | 'booking';
    id: string;
    preview?: string;
  };
  read: boolean;
  createdAt: string;
  groupId?: string; // For grouping notifications
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'MENTION'           // @mentioned in a post
  | 'REPLY'             // Replied to your post
  | 'QUOTE'             // Quoted your post
  | 'RETWEET'          // Retweeted your post
  | 'LIKE'             // Liked your post
  | 'FOLLOW'           // Started following you
  | 'BOOKING_REQUEST'  // New booking request
  | 'BOOKING_UPDATE'   // Booking status update
  | 'PAYMENT_SUCCESS'  // Payment completed
  | 'EVENT_REMINDER'   // Event reminder
  | 'VERIFICATION'     // Account verification
  | 'TRENDING'         // Trending in your area
  | 'RECOMMENDATION'   // New recommendation
  | 'SYSTEM_ALERT';    // System announcement

export const NOTIFICATION_TYPES: Record<NotificationType, {
  label: string;
  icon: string;
  color: string;
  action: string;
}> = {
  MENTION: {
    label: 'Mentioned you',
    icon: 'at',
    color: '#1DA1F2',
    action: 'mentioned you',
  },
  REPLY: {
    label: 'Replied to you',
    icon: 'chatbubble',
    color: '#1DA1F2',
    action: 'replied to you',
  },
  QUOTE: {
    label: 'Quoted you',
    icon: 'quote',
    color: '#1DA1F2',
    action: 'quoted you',
  },
  RETWEET: {
    label: 'Retweeted',
    icon: 'repeat',
    color: '#17BF63',
    action: 'retweeted',
  },
  LIKE: {
    label: 'Liked',
    icon: 'heart',
    color: '#E0245E',
    action: 'liked',
  },
  FOLLOW: {
    label: 'Followed you',
    icon: 'person-add',
    color: '#794BC4',
    action: 'followed you',
  },
  BOOKING_REQUEST: {
    label: 'Booking Request',
    icon: 'calendar',
    color: '#F45D22',
    action: 'requested booking',
  },
  BOOKING_UPDATE: {
    label: 'Booking Update',
    icon: 'notifications',
    color: '#F45D22',
    action: 'updated booking',
  },
  PAYMENT_SUCCESS: {
    label: 'Payment Success',
    icon: 'card',
    color: '#17BF63',
    action: 'completed payment',
  },
  EVENT_REMINDER: {
    label: 'Event Reminder',
    icon: 'alarm',
    color: '#FFAD1F',
    action: 'event reminder',
  },
  VERIFICATION: {
    label: 'Verification',
    icon: 'checkmark-circle',
    color: '#1DA1F2',
    action: 'verified account',
  },
  TRENDING: {
    label: 'Trending',
    icon: 'trending-up',
    color: '#1DA1F2',
    action: 'trending now',
  },
  RECOMMENDATION: {
    label: 'Recommendation',
    icon: 'star',
    color: '#FFAD1F',
    action: 'recommended for you',
  },
  SYSTEM_ALERT: {
    label: 'System Alert',
    icon: 'warning',
    color: '#E0245E',
    action: 'system update',
  },
};

export type NotificationFilter = 
  | 'all'
  | 'mentions'
  | 'likes'
  | 'replies'
  | 'follows'
  | 'bookings'
  | 'payments'
  | 'events'
  | 'unread';

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  actors: Array<{
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  }>;
  count: number;
  content: string;
  target?: {
    type: string;
    id: string;
    preview: string;
  };
  read: boolean;
  timestamp: string;
  createdAt: string;
}