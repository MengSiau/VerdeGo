// Used as a route to render the RideRequestSent screen.
// IMPORTANT -> filename here acts as the route path; [id] is a dynamic segment (the ride id)

import { RideRequestSent } from '@/src/screens/RideRequestSent/RideRequestSent';

export default function RideRequestSentRoute() {
  return <RideRequestSent />;
}
