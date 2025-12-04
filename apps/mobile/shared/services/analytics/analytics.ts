export const AnalyticsService = {
  initialize: async () => {
    // No-op for now; plug in real analytics SDK (e.g., Amplitude, Firebase) later
    console.log('AnalyticsService initialized');
  },
  trackEvent: (name: string, properties?: Record<string, any>) => {
    console.log('Analytics event:', name, properties);
  },
};

export default AnalyticsService;
