import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import { VehiclesProvider } from '@/src/data/TempVehicleContext';

import { RidesStoreProvider } from '@/src/data/RidesStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <VehiclesProvider>
        <RidesStoreProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Top-level bottom-nav sections swap instantly rather than sliding in like a
                deeper/nested screen - everything else keeps the default push animation. */}
            <Stack.Screen name="home" options={{ animation: 'none' }} />
            <Stack.Screen name="my-rides" options={{ animation: 'none' }} />
          </Stack>
        </RidesStoreProvider>
      </VehiclesProvider>
    </ThemeProvider>
  );
}
