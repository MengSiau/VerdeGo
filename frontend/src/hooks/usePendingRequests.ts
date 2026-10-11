import { useCallback, useEffect, useRef, useState } from 'react';

import { getPendingRequests, type PendingRequest } from '@/src/api/requests';
import { useAuth } from '@/src/auth/AuthProvider';

// Fetches every pending passenger request across every ride the current user drives
// (GET /api/rides/requests). Same loading/error/refresh shape as the other ride hooks.
export function usePendingRequests() {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [requests, setRequests] = useState<PendingRequest[]>([]);
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
      const result = await getPendingRequests();
      if (active.current && id === requestId.current) {
        setRequests(result);
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load passenger requests.');
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

  return { requests, loading, error, refresh };
}
