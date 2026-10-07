import { useCallback, useEffect, useRef, useState } from 'react';

import { getRide } from '@/src/api/rides';
import { useAuth } from '@/src/auth/AuthProvider';
import { mapRideWithDetailsToRide } from '@/src/data/browseRides';
import type { Ride } from '@/src/data/rides';

// Fetches a single ride from the backend (GET /api/rides/<id>). Same loading/error/refresh
// shape as useBrowseRides/VehiclesStore.
export function useRideDetails(rideId: string | undefined) {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(signedIn && Boolean(rideId));
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!signedIn || !rideId) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getRide(rideId);
      if (active.current && id === requestId.current) {
        setRide(mapRideWithDetailsToRide(result));
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load this ride.');
      }
    } finally {
      if (active.current && id === requestId.current) setLoading(false);
    }
  }, [signedIn, rideId]);

  useEffect(() => {
    active.current = true;
    void refresh();
    return () => {
      active.current = false;
      ++requestId.current;
    };
  }, [refresh]);

  return { ride, loading, error, refresh };
}
