export const NotificationService = {
  initialize: async () => {
    // no-op; configure push notifications (e.g., expo-notifications) later
    console.log('NotificationService initialized');
  },
  requestPermission: async () => true,
  sendLocalNotification: async (payload: any) => {
    console.log('Local notification:', payload);
  },
};

export default NotificationService;
