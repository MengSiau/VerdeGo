import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DUMMY_RIDES, MY_UPCOMING_RIDES, type MyRideBooking, type Ride } from './rides';

type RidesStoreValue = {
  rides: Ride[];
  myBookings: MyRideBooking[];
  /** Adds a newly-posted ride to the shared feed and records it as one of "my" rides. */
  postRide: (ride: Ride, dateLabel: string) => void;
};

const RidesStoreContext = createContext<RidesStoreValue | null>(null);

// App-wide store for ride data, seeded from the static demo dataset. This is what lets a
// ride posted via the Post Ride wizard actually show up elsewhere (Home feed, My Rides)
// without a real backend - DUMMY_RIDES/MY_UPCOMING_RIDES alone are just static arrays and
// wouldn't trigger re-renders if mutated directly.
export function RidesStoreProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>(DUMMY_RIDES);
  const [myBookings, setMyBookings] = useState<MyRideBooking[]>(MY_UPCOMING_RIDES);

  const value = useMemo<RidesStoreValue>(
    () => ({
      rides,
      myBookings,
      postRide: (ride, dateLabel) => {
        setRides((prev) => [ride, ...prev]);
        setMyBookings((prev) => [{ rideId: ride.id, dateLabel }, ...prev]);
      },
    }),
    [rides, myBookings]
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
