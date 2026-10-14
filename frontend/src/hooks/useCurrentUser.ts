import { useCallback, useEffect, useRef, useState } from 'react';

import { getCurrentUser, type User } from '@/src/api/users';
import { useAuth } from '@/src/auth/AuthProvider';

// Fetches the signed-in user's profile row (GET /api/users/me). Same loading/error/refresh
// shape as useBrowseRides/useRideDetails/VehiclesStore.
export function useCurrentUser() {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(signedIn);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!signedIn) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentUser();
      if (active.current && id === requestId.current) {
        setUser(result);
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load your profile.');
      }
    } finally {
      if (active.current && id === requestId.current) setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    active.current = true;
    void refresh();
    return () => {
      active.current = false;
      ++requestId.current;
    };
  }, [refresh]);

  return { user, loading, error, refresh };
}
