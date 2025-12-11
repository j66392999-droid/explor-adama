// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  manifest: { extra: {} },
  sessionId: 'test-session-id',
  platform: { ios: {} },
}));

// Set up environment variables
beforeAll(() => {
  process.env.EXPO_OS = 'ios', 'android'; // or 'android' or 'web'
});

// Mock other Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-modules-core', () => ({
  // Add minimal implementation
}));