// Used as a route to render the PostReview screen.
// IMPORTANT -> filename here acts as the route path; [id] is a dynamic segment (the ride id)

import { PostReview } from '@/src/screens/PostReview/PostReview';

export default function PostReviewRoute() {
  return <PostReview />;
}
