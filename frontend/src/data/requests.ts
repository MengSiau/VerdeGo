// Passenger requests awaiting a driver's response. Demo data until the backend's
// ride_passengers endpoints exist - see the ride-requests backend plan.
export type PassengerRequest = {
  id: string;
  rideId: string;
  passengerName: string;
  rating: number;
  pickup: string;
  pickupTime: string;
};

export const DUMMY_REQUESTS: PassengerRequest[] = [
  {
    id: 'req-1',
    rideId: '6',
    passengerName: 'Alex Nguyen',
    rating: 4,
    pickup: 'Springvale Station',
    pickupTime: '8:10 AM',
  },
  {
    id: 'req-2',
    rideId: '6',
    passengerName: 'Sara Patel',
    rating: 5,
    pickup: 'Waverley Park',
    pickupTime: '8:15 AM',
  },
  {
    id: 'req-3',
    rideId: '7',
    passengerName: 'Ben Liu',
    rating: 4,
    pickup: 'Brandon Park',
    pickupTime: '8:55 AM',
  },
];
