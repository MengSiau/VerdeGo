import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { createRide, getRides, type CreateRideRequest } from '@/src/api/rides';
import { useAuth } from '@/src/auth/AuthProvider';

import { toUiRides } from './rideadapter';
import { MY_UPCOMING_RIDES, type MyRideBooking, type Ride } from './rides';

type RidesStoreValue = {
  /** The browse feed: rides posted by other people. */
  rides: Ride[];
  /** Rides the signed-in user is driving. */
  myRides: Ride[];
  /** Both lists together. Use this to look a ride up by id. */
  allRides: Ride[];
  myBookings: MyRideBooking[];
  /** The signed-in user's id, for "am I the driver?" checks. */
  currentUserId: string | null;
  /** True during the first load and any manual refresh. */
  loading: boolean;
  /** Message from the last failed fetch, or null. */
  error: string | null;
  /** Re-fetches both lists. Use for pull-to-refresh. */
  refresh: () => Promise<void>;
  /** Posts a ride to the backend, then re-fetches so the feed reflects it. */
  postRide: (request: CreateRideRequest, dateLabel: string) => Promise<void>;
};

const RidesStoreContext = createContext<RidesStoreValue | null>(null);

/**
 * App-wide store for ride data, backed by the Flask API.
 *
 * Two lists rather than one: GET /api/rides deliberately excludes your own
 * rides from the browse feed, so a driver's posted ride would otherwise
 * disappear from the app entirely. ?mine=true fetches those separately.
 */
export function RidesStoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  // Remount on account change so one user's feed never leaks into the next.
  return (
    <AccountRidesProvider
      key={session?.user.id ?? 'signed-out'}
      userId={session?.user.id ?? null}>
      {children}
    </AccountRidesProvider>
  );
}

function AccountRidesProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  // TODO: no backend equivalent yet. ride_passengers is where this belongs
  // once there's an endpoint for it.
  const [myBookings, setMyBookings] = useState<MyRideBooking[]>(MY_UPCOMING_RIDES);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const active = useRef(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!userId) return;

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      // In parallel - they're independent requests, and the feed shouldn't
      // wait on the usually much shorter "my rides" list.
      const [feed, mine] = await Promise.all([getRides(), getRides({ mine: true })]);

      if (active.current && id === requestId.current) {
        setRides(toUiRides(feed));
        setMyRides(toUiRides(mine));
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Could not load rides');
      }
    } finally {
      if (active.current && id === requestId.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    active.current = true;
    void refresh();
    return () => {
      active.current = false;
      ++requestId.current;
    };
  }, [refresh]);

  const postRide = useCallback(
    async (request: CreateRideRequest, dateLabel: string) => {
      const created = await createRide(request);

      // The POST returns the bare ride row, not the joined shape the feed
      // renders, so re-fetch rather than trying to reconstruct it here.
      await refresh();

      if (active.current) {
        setMyBookings((prev) => [{ rideId: created.ride_id, dateLabel }, ...prev]);
      }
    },
    [refresh],
  );

  const allRides = useMemo(() => [...myRides, ...rides], [myRides, rides]);

  const value = useMemo<RidesStoreValue>(
    () => ({
      rides,
      myRides,
      allRides,
      myBookings,
      currentUserId: userId,
      loading,
      error,
      refresh,
      postRide,
    }),
    [rides, myRides, allRides, myBookings, userId, loading, error, refresh, postRide],
  );

  return <RidesStoreContext.Provider value={value}>{children}</RidesStoreContext.Provider>;
}

export function useRidesStore() {
  const context = useContext(RidesStoreContext);
  if (!context) {
    throw new Error('useRidesStore must be used within a RidesStoreProvider');
  }
  return context;
}