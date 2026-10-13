import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DUMMY_REQUESTS, type PassengerRequest } from './requests';
import {
  DUMMY_RIDES,
  MY_DRIVING_RIDES,
  MY_PAST_RIDES,
  MY_UPCOMING_RIDES,
  type MyRideBooking,
  type Ride,
} from './rides';

type RidesStoreValue = {
  rides: Ride[];
  myBookings: MyRideBooking[];
  myPastBookings: MyRideBooking[];
  /** Pending passenger requests on rides the current user drives. */
  requests: PassengerRequest[];
  /** Adds a newly-posted ride to the shared feed and records it as one of "my" rides. */
  postRide: (ride: Ride, dateLabel: string) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
};

const RidesStoreContext = createContext<RidesStoreValue | null>(null);

// App-wide store for ride data, seeded from the static demo dataset. This is what lets a
// ride posted via the Post Ride wizard actually show up elsewhere (Home feed, My Rides)
// without a real backend - DUMMY_RIDES/MY_UPCOMING_RIDES alone are just static arrays and
// wouldn't trigger re-renders if mutated directly.
export function RidesStoreProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>(DUMMY_RIDES);
  const [myBookings, setMyBookings] = useState<MyRideBooking[]>([...MY_UPCOMING_RIDES, ...MY_DRIVING_RIDES]);
  const [myPastBookings] = useState<MyRideBooking[]>(MY_PAST_RIDES);
  const [requests, setRequests] = useState<PassengerRequest[]>(DUMMY_REQUESTS);

  const value = useMemo<RidesStoreValue>(
    () => ({
      rides,
      myBookings,
      myPastBookings,
      requests,
      postRide: (ride, dateLabel) => {
        setRides((prev) => [ride, ...prev]);
        setMyBookings((prev) => [{ rideId: ride.id, dateLabel }, ...prev]);
      },
      // TODO: call POST /api/rides/requests/<id> (accept) once the backend route exists.
      // Accepting fills a seat - add the passenger to the ride's confirmed list and drop
      // the request from the pending queue, same as a real accept would.
      acceptRequest: (requestId) => {
        const request = requests.find((r) => r.id === requestId);
        if (!request) return;

        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setRides((prev) =>
          prev.map((ride) =>
            ride.id === request.rideId
              ? {
                  ...ride,
                  confirmedPassengers: [
                    ...ride.confirmedPassengers,
                    { name: request.passengerName },
                  ],
                }
              : ride
          )
        );
      },
      // TODO: call POST /api/rides/requests/<id> (decline) once the backend route exists.
      declineRequest: (requestId) => {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      },
    }),
    [rides, myBookings, myPastBookings, requests]
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
