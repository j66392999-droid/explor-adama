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
              {/* Top-level app groups and primary screens only. Keep this list in sync with files under `app/` */}
              <Stack.Screen name="index" />
              <Stack.Screen name="tab-navigator" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(auth)" />
              
              {/* Booking Screens */}
              <Stack.Screen name="BookingConfirmation" />
              <Stack.Screen name="BookingDetail" />
              <Stack.Screen name="BookingHistory" />
              
              {/* Payment Screens */}
              <Stack.Screen 
                name="Payment" 
                options={{ 
                  presentation: 'modal' // Optional: shows as modal
                }}
              />
              
              <Stack.Screen 
                name="PaymentSuccess" 
                options={{ 
                  presentation: 'modal'
                }}
              />
              
              {/* Add other screens as needed */}
              <Stack.Screen name="Booking" />
              
              {/* Ticket screens - these will be automatically matched with app/(screens)/ */}
              <Stack.Screen name="Tickets" />
              <Stack.Screen name="TicketDetail" />
              <Stack.Screen 
                name="QRScanner" 
                options={{ presentation: 'modal' }}
              />
            </Stack>
          </ThemeProvider>
        </ResponsiveProvider>
      </SafeAreaProvider>
    </Provider>
  );
}