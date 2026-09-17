// Used as a route to render the MyRideDetails screen.
// IMPORTANT -> filename here acts as the route path; [id] is a dynamic segment (the ride id)

import { MyRideDetails } from '@/src/screens/MyRideDetails/MyRideDetails';

export default function MyRideDetailsRoute() {
  return <MyRideDetails />;
}
