// Used as a route to render the RideDetails screen.
// IMPORTANT -> filename here acts as the route path; [id] is a dynamic segment (the ride id)

import { RideDetails } from '@/src/screens/RideDetails/RideDetails';

export default function RideDetailsRoute() {
  return <RideDetails />;
}
