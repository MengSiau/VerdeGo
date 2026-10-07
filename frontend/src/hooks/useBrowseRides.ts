import { useCallback, useEffect, useRef, useState } from 'react';

import { getRides } from '@/src/api/rides';
import { useAuth } from '@/src/auth/AuthProvider';
import { mapRideWithDetailsToRide } from '@/src/data/browseRides';
import type { Ride } from '@/src/data/rides';

// Fetches the real backend ride feed (GET /api/rides, which already excludes the caller's
// own vehicles server-side). Same loading/error/refresh/race-guard shape as VehiclesStore -
// a plain hook rather than a Context, since only Home needs this for now.
export function useBrowseRides() {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [rides, setRides] = useState<Ride[]>([]);
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
      const results = await getRides();
      if (active.current && id === requestId.current) {
        setRides(results.map(mapRideWithDetailsToRide));
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load rides.');
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

  return { rides, loading, error, refresh };
}
