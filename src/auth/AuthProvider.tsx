// Auth state for VerdeGo. Wraps the whole app from app/_layout.tsx.
// Usage: const { session, signInWithMonash, signOut } = useAuth();

import type { Session } from '@supabase/supabase-js';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { supabase } from '@/src/auth/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  /** True until the stored session has been checked on launch. */
  initialising: boolean;
  /** True while an interactive sign in is in progress. */
  signingIn: boolean;
  error: string | null;
  signInWithMonash: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitialising(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithMonash = useCallback(async () => {
    setError(null);
    setSigningIn(true);

    try {
      // In Expo Go this resolves to an exp:// URL derived from the dev server,
      // which is why Supabase's redirect allow-list needs the exp://** wildcard.
      // In a standalone build it resolves to verdego:// (see app.json "scheme").
      const redirectTo = Linking.createURL('/auth/callback');

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            // Skips Google's account picker and forces Monash SSO
            hd: 'student.monash.edu',
          },
        },
      });

      if (oauthError) throw new Error(oauthError.message);
      if (!data?.url) throw new Error('Could not start sign-in. Please try again.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      // User dismissed the browser - not an error.
      if (result.type !== 'success') return;

      const { params, errorCode } = QueryParams.getQueryParams(result.url);
      if (errorCode) throw new Error(errorCode);

      // A non-Monash account rejected by the Postgres hook surfaces here.
      if (params.error_description) {
        throw new Error(decodeURIComponent(params.error_description));
      }

      const { access_token, refresh_token } = params;
      if (!access_token || !refresh_token) {
        throw new Error('Sign-in did not complete. Please try again.');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) throw new Error(sessionError.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong signing in.');
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      initialising,
      signingIn,
      error,
      signInWithMonash,
      signOut,
      clearError,
    }),
    [session, initialising, signingIn, error, signInWithMonash, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
