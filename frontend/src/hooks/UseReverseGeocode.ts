import { useEffect, useState } from 'react';

import { reverseGeocode, type Coordinate } from '@/src/utils/reverseGeocode';

export type { Coordinate };

type ReverseGeocodeState = {
  /** Human-readable label for the coordinate, or a fallback. */
  label: string;
  /** True while a lookup is in flight. */
  loading: boolean;
};

// Wait for the user to stop panning before asking the geocoder. Both iOS and
// Android throttle geocoding requests, and firing one per frame will get you
// rate-limited within seconds.
const DEBOUNCE_MS = 600;

/**
 * Turns a map coordinate into a readable place name as the user pans the map in
 * PostLocation. See src/utils/reverseGeocode.ts for the actual lookup, caching, and
 * platform caveats - this hook just adds the debounce a live-dragging pin needs.
 */
export function useReverseGeocode(coordinate: Coordinate): ReverseGeocodeState {
  const [label, setLabel] = useState('Locating…');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      const resolved = await reverseGeocode(coordinate);
      if (!cancelled) {
        setLabel(resolved);
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [coordinate.latitude, coordinate.longitude]);

  return { label, loading };
}
