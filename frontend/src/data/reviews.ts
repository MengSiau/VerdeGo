// Reviews other riders have left for the current user as a driver. Demo data until the
// backend exists - the shape matches what a reviews endpoint would return.
export type ReceivedReview = {
  id: string;
  reviewerName: string;
  rating: number;
  message: string;
  timeAgo: string;
};

export const DUMMY_RECEIVED_REVIEWS: ReceivedReview[] = [
  {
    id: 'r1',
    reviewerName: 'Mei Lin',
    rating: 5,
    message: 'Super punctual and the car was spotless. Great conversation on the way in too.',
    timeAgo: '2 days ago',
  },
  {
    id: 'r2',
    reviewerName: 'James Chen',
    rating: 4,
    message:
      'Smooth ride and very friendly. We ran into some traffic near the Monash Freeway exit, but you kept us updated the whole time and dropped us off right at the entrance I needed. Would happily ride with you again, and I appreciated the stop for a coffee on the way.',
    timeAgo: '1 week ago',
  },
  {
    id: 'r3',
    reviewerName: 'Arjun Patel',
    rating: 5,
    message: 'On time, safe driving, easy pickup.',
    timeAgo: '2 weeks ago',
  },
  {
    id: 'r4',
    reviewerName: 'Sophie Nguyen',
    rating: 3,
    message:
      'The ride itself was fine, but we left about ten minutes after the time you gave in the app. I understand traffic can be unpredictable, but a quick message would have helped me plan. The car was clean and the drive was comfortable, so I would still consider riding again if the timing is clearer.',
    timeAgo: '1 month ago',
  },
  {
    id: 'r5',
    reviewerName: 'Daniel Okafor',
    rating: 5,
    message: 'Great driver, will ride again.',
    timeAgo: '1 month ago',
  },
];
