import { useCallback, useEffect, useRef, useState } from 'react';

import { getMyRides } from '@/src/api/rides';
import { useAuth } from '@/src/auth/AuthProvider';
import { mapRideWithDetailsToRide } from '@/src/data/browseRides';
import type { Ride } from '@/src/data/rides';

export type MyRideEntry = {
  ride: Ride;
  role: 'driver' | 'passenger';
};

// Fetches every ride the current user is involved in (GET /api/rides/mine, which already
// tells us the role per ride) and splits it into Upcoming/Past by ride_status. Same
// loading/error/refresh shape as useBrowseRides/useRideDetails/VehiclesStore.
export function useMyRides() {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [upcoming, setUpcoming] = useState<MyRideEntry[]>([]);
  const [past, setPast] = useState<MyRideEntry[]>([]);
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
      const results = await getMyRides();
      if (!active.current || id !== requestId.current) return;

      const upcomingEntries: MyRideEntry[] = [];
      const pastEntries: MyRideEntry[] = [];

      for (const item of results) {
        const entry: MyRideEntry = { ride: mapRideWithDetailsToRide(item), role: item.role };
        if (item.ride.ride_status === 'scheduled' || item.ride.ride_status === 'ongoing') {
          upcomingEntries.push(entry);
        } else {
          pastEntries.push(entry);
        }
      }

      // Rides you're driving surface first - it's your own posting, not just something you joined.
      upcomingEntries.sort((a, b) => (a.role === b.role ? 0 : a.role === 'driver' ? -1 : 1));

      setUpcoming(upcomingEntries);
      setPast(pastEntries);
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load your rides.');
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

  return { upcoming, past, loading, error, refresh };
}
