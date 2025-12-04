import React from 'react'
import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import { store } from '../store'
import { ThemeProvider } from '@/shared/hooks/ui/useTheme'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function AppLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Root stacks for app area and auth area - use full nested group route paths */}
            <Stack.Screen name="(app)/(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  )
}
