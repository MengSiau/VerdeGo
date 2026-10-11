import { useCallback, useEffect, useRef, useState } from 'react';

import { getPendingRequests, type PendingRequest } from '@/src/api/requests';
import { useAuth } from '@/src/auth/AuthProvider';
import { mapRideWithDetailsToRide } from '@/src/data/browseRides';
import type { Ride } from '@/src/data/rides';

export type RequestGroup = {
  ride: Ride;
  requests: PendingRequest[];
};

// Fetches every pending passenger request across every ride the current user drives
// (GET /api/rides/requests) and groups them by ride, mapping each ride only once (not
// once per request on it) since mapping reverse-geocodes the pickup point. Same
// loading/error/refresh shape as the other ride hooks.
export function usePendingRequests() {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [groups, setGroups] = useState<RequestGroup[]>([]);
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
      const results = await getPendingRequests();

      const requestsByRideId = new Map<string, PendingRequest[]>();
      for (const item of results) {
        const rideId = item.ride.ride_id;
        if (!requestsByRideId.has(rideId)) requestsByRideId.set(rideId, []);
        requestsByRideId.get(rideId)!.push(item);
      }

      const grouped = await Promise.all(
        Array.from(requestsByRideId.values()).map(async (requestsForRide) => ({
          ride: await mapRideWithDetailsToRide(requestsForRide[0]),
          requests: requestsForRide,
        }))
      );

      if (active.current && id === requestId.current) {
        setGroups(grouped);
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

  const totalPending = groups.reduce((sum, group) => sum + group.requests.length, 0);

  return { groups, totalPending, loading, error, refresh };
}
