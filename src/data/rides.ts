export type Passenger = {
  name: string;
  pickup: string;
};

export type Ride = {
  id: string;
  driverName: string;
  rating: number;
  ratingCount: number;
  pickup: string;
  destination: string;
  date: string;
  departureTime: string;
  dropoffTimeEstimate: string;
  distanceKm: number;
  seats: number;
  durationMinutes: number;
  price: number;
  co2SavedKg: number; // saved vs driving alone
  co2EstimateKg: number; // total trip CO2 estimate
  confirmedPassengers: Passenger[];
};

// Demo data standing in for a real rides feed/backend.
export const DUMMY_RIDES: Ride[] = [
  {
    id: '1',
    driverName: 'Priya Sharma',
    rating: 5,
    ratingCount: 47,
    pickup: 'Glen Waverley Station',
    destination: 'Monash Clayton Campus',
    date: 'Wed, 13 Aug 2025',
    departureTime: '8:15 AM',
    dropoffTimeEstimate: '8:33 AM',
    distanceKm: 18.4,
    seats: 2,
    durationMinutes: 18,
    price: 4.2,
    co2SavedKg: 0.58,
    co2EstimateKg: 0.27,
    confirmedPassengers: [{ name: 'James Chen', pickup: 'Springvale Stn' }],
  },
  {
    id: '2',
    driverName: 'James Chen',
    rating: 4,
    ratingCount: 21,
    pickup: 'Clayton Station',
    destination: 'Monash Clayton Campus',
    date: 'Wed, 13 Aug 2025',
    departureTime: '8:30 AM',
    dropoffTimeEstimate: '8:38 AM',
    distanceKm: 6.2,
    seats: 3,
    durationMinutes: 8,
    price: 2.5,
    co2SavedKg: 0.4,
    co2EstimateKg: 0.15,
    confirmedPassengers: [],
  },
  {
    id: '3',
    driverName: 'Mei Lin',
    rating: 5,
    ratingCount: 63,
    pickup: 'Caulfield Station',
    destination: 'Monash Clayton Campus',
    date: 'Wed, 13 Aug 2025',
    departureTime: '8:45 AM',
    dropoffTimeEstimate: '9:07 AM',
    distanceKm: 24.1,
    seats: 3,
    durationMinutes: 22,
    price: 5.8,
    co2SavedKg: 1.1,
    co2EstimateKg: 0.35,
    confirmedPassengers: [{ name: 'Arjun Patel', pickup: 'Oakleigh Stn' }],
  },
  {
    id: '4',
    driverName: 'Arjun Patel',
    rating: 4,
    ratingCount: 15,
    pickup: 'Huntingdale Station',
    destination: 'Monash Clayton Campus',
    date: 'Wed, 13 Aug 2025',
    departureTime: '9:00 AM',
    dropoffTimeEstimate: '9:15 AM',
    distanceKm: 12.8,
    seats: 4,
    durationMinutes: 15,
    price: 3.1,
    co2SavedKg: 0.9,
    co2EstimateKg: 0.22,
    confirmedPassengers: [],
  },
];
