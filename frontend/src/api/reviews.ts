import { apiFetch } from './client';

export interface CreateReviewRequest {
    ride_id: string;
    rating: number;
    review_text?: string;
}

export interface Review {
    review_id: string;
    ride_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
}

export interface ReceivedReview {
    review_id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
    reviewer: {
        user_id: string;
        name: string;
    };
}

// Only ever a passenger -> driver review, for a ride the caller actually rode on. The
// backend 409s if this ride's already been reviewed, 400s if it isn't 'completed' yet.
export function createReview(data: CreateReviewRequest): Promise<Review> {
    return apiFetch<Review>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Every review the current user has received (as a reviewee), newest first.
export function getMyReceivedReviews(): Promise<ReceivedReview[]> {
    return apiFetch<ReceivedReview[]>('/api/reviews/me');
}
