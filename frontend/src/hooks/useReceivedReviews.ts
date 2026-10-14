import { useCallback, useEffect, useRef, useState } from 'react';

import { getMyReceivedReviews } from '@/src/api/reviews';
import { useAuth } from '@/src/auth/AuthProvider';
import type { ReceivedReview } from '@/src/data/reviews';
import { formatTimeAgo } from '@/src/utils/timeAgo';

// Fetches every review the current user has received (GET /api/reviews/me) and maps it
// onto the same display shape the Reviews screen was built against. Same loading/error/
// refresh shape as the other hooks.
export function useReceivedReviews() {
  const { session } = useAuth();
  const signedIn = Boolean(session);

  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [loading, setLoading] = useState(signedIn);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!signedIn) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const results = await getMyReceivedReviews();
      if (active.current && id === requestId.current) {
        setReviews(
          results.map((r) => ({
            id: r.review_id,
            reviewerName: r.reviewer.name,
            rating: r.rating,
            message: r.review_text ?? '',
            timeAgo: formatTimeAgo(r.created_at),
          }))
        );
      }
    } catch (e) {
      if (active.current && id === requestId.current) {
        setError(e instanceof Error ? e.message : 'Unable to load your reviews.');
      }
    } finally {
      if (active.current && id === requestId.current) setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    active.current = true;
    void refresh();
    return () => {
      active.current = false;
      ++requestId.current;
    };
  }, [refresh]);

  return { reviews, loading, error, refresh };
}
