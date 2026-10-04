// Supabase client for VerdeGo.
// Env vars live in .env at the project root and MUST be prefixed EXPO_PUBLIC_
// to be readable from app code. Restart the dev server after changing them.

import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add them to .env in the project root and restart the dev server.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // App tables live in the `dev` schema, not `public`. Change this (and the
  // Exposed schemas setting in the dashboard) if/when you merge into public.
  db: { schema: 'dev' },
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // must be false in React Native
  },
});

// Token refresh only runs while the app is awake. Without this, a session can go
// stale while the app is backgrounded and then fail on resume - an intermittent
// bug that is very hard to reproduce on purpose.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});