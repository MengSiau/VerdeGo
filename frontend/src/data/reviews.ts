// Display shape for a review shown on Profile > "View your reviews" - mapped from the
// backend's GET /api/reviews/me by useReceivedReviews.
export type ReceivedReview = {
  id: string;
  reviewerName: string;
  rating: number;
  message: string;
  timeAgo: string;
};
