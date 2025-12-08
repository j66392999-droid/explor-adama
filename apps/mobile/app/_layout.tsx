// app/_layout.tsx (Updated for React Navigation)
import React from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ThemeProvider } from '@/shared/hooks/ui/useTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ResponsiveProvider } from '@/shared/context/ResponsiveProvider';

export default function AppLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ResponsiveProvider>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="services" />
              <Stack.Screen name="orders" />
              <Stack.Screen name="blog" />
              <Stack.Screen name="events" />
            </Stack>
          </ThemeProvider>
        </ResponsiveProvider>
      </SafeAreaProvider>
    </Provider>
  );
}