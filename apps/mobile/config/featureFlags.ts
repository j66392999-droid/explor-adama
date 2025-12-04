export const FeatureFlags = {
  // Authentication Features
  auth: {
    socialLogin: true,
    biometricAuth: true,
    twoFactorAuth: false, // Coming soon
    guestMode: true,
  },

  // Discovery Features
  discovery: {
    advancedSearch: true,
    mapIntegration: true,
    offlineMaps: false, // Coming soon
    arNavigation: false, // Future feature
  },

  // Booking Features
  booking: {
    instantBooking: true,
    groupBooking: true,
    bookingModification: true,
    cancellationProtection: false, // Coming soon
  },

  // Payment Features
  payments: {
    chapaIntegration: true,
    stripeIntegration: false, // Coming soon
    walletSystem: false, // Future feature
    installmentPayments: false, // Future feature
  },

  // Social Features
  social: {
    userReviews: true,
    photoSharing: true,
    socialFeed: true,
    directMessaging: false, // Coming soon
    eventSharing: true,
  },

  // AI Features
  ai: {
    personalizedRecommendations: true,
    chatAssistant: true,
    smartSearch: true,
    voiceCommands: false, // Future feature
  },

  // Experimental Features
  experimental: {
    darkMode: true,
    rtlSupport: true,
    videoReviews: false, // Beta
    liveStreaming: false, // Beta
  },

  // Regional Features
  regional: {
    ethiopianCalendar: true,
    localLanguages: true,
    regionalContent: true,
    localPaymentMethods: true,
  },
} as const;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (featurePath: string): boolean => {
  const parts = featurePath.split('.');
  let current: any = FeatureFlags;

  for (const part of parts) {
    if (current[part] === undefined) {
      return false;
    }
    current = current[part];
  }

  return current === true;
};

// Type for feature flags
export type FeatureFlagsType = typeof FeatureFlags;