import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type GreenScoreGrade = 'A+' | 'A' | 'B' | 'C';

export type GreenScoreResult = {
  grade: GreenScoreGrade;
  co2Per100km: number;
  percentBelowAverage: number;
};

export type PostRideDraft = {
  pickup?: string;
  date?: string; // e.g. "Wed, Aug 13"
  hour?: string; // "08"
  minute?: string; // "15"
  period?: 'AM' | 'PM';
  seats?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  fuelType?: FuelType;
  greenScore?: GreenScoreResult;
};

type PostRideContextValue = {
  draft: PostRideDraft;
  updateDraft: (patch: Partial<PostRideDraft>) => void;
};

const PostRideContext = createContext<PostRideContextValue | null>(null);

// This context is used to manage the state of the post ride draft across different screens in the Post Ride flow.
export function PostRideProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<PostRideDraft>({});
  const value = useMemo(
    () => ({
      draft,
      updateDraft: (patch: Partial<PostRideDraft>) => setDraft((prev) => ({ ...prev, ...patch })),
    }),
    [draft]
  );

  return <PostRideContext.Provider value={value}>{children}</PostRideContext.Provider>;
}

// Custom hook to access the PostRideContext. Throws an error if used outside of a PostRideProvider.
// use to update the draft ride state across different screens in the Post Ride flow.
export function usePostRideDraft() {
  const context = useContext(PostRideContext);
  if (!context) {
    throw new Error('usePostRideDraft must be used within a PostRideProvider');
  }
  return context;
}
