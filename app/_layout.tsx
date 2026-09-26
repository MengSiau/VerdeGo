import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
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

import { AuthProvider, useAuth } from '@/src/auth/AuthProvider';
import { RidesStoreProvider } from '@/src/data/RidesStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Routes reachable while signed out. Everything else requires a session.
// The app/ directory uses flat routes, so we match on the first path segment.
// '' is app/index.tsx (the splash screen).
const PUBLIC_SEGMENTS = new Set(['', 'login-signin', 'signup-email', 'verify-email']);

// Where a signed-in user lands if they hit a public route.
const SIGNED_IN_HOME = '/home' as const;

function RootNavigator() {
  const { session, initialising } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initialising) return;

    const current = segments[0] ?? '';
    const isPublic = PUBLIC_SEGMENTS.has(current);

    if (!session && !isPublic) {
      // Signed out, but looking at a protected screen.
      router.replace('/login-signin');
    } else if (session && isPublic) {
      // Signed in, but sitting on the splash or login screen.
      router.replace(SIGNED_IN_HOME);
    }
  }, [session, initialising, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Top-level bottom-nav sections swap instantly rather than sliding in like a
          deeper/nested screen - everything else keeps the default push animation. */}
      <Stack.Screen name="home" options={{ animation: 'none' }} />
      <Stack.Screen name="my-rides" options={{ animation: 'none' }} />
    </Stack>
  );
}

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
      <AuthProvider>
        <RidesStoreProvider>
          <RootNavigator />
        </RidesStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}