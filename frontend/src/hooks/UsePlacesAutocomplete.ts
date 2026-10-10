import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type PlaceSuggestion = {
  placeId: string;
  /** Bold line - usually the venue or street. */
  primaryText: string;
  /** Muted line - suburb, state. */
  secondaryText: string;
};

export type ResolvedPlace = {
  name: string;
  coordinate: Coordinate;
};

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_URL = 'https://places.googleapis.com/v1/places';

// Bias toward greater Melbourne. Without this, "Clayton" matches several
// countries and the first result is rarely the one you want.
const BIAS_CENTRE: Coordinate = { latitude: -37.9105, longitude: 145.1362 };
const BIAS_RADIUS_M = 40000;

// Wait for a pause in typing. Each keystroke would otherwise be a request.
const DEBOUNCE_MS = 350;

// Two characters returns noise and burns quota.
const MIN_QUERY_LENGTH = 3;

/**
 * Google Places autocomplete, called directly from the app.
 *
 * NOTE: the API key is bundled into the app and is extractable. It is
 * restricted to the Places API only, so the exposure is quota consumption
 * rather than access to any user data. Moving these calls behind the Flask
 * backend is recorded as future work - see SETUP-PLACES.md §7.
 *
 * Session tokens matter for billing: Google groups the autocomplete requests
 * and the final details lookup into one billable session as long as they share
 * a token. A fresh token is minted after each selection.
 */
export function usePlacesAutocomplete(bias: Coordinate = BIAS_CENTRE) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionToken = useRef<string>(Crypto.randomUUID());

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (!API_KEY) {
      setError('Place search is not configured');
      return;
    }

    setLoading(true);
    setError(null);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(AUTOCOMPLETE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
          },
          body: JSON.stringify({
            input: trimmed,
            includedRegionCodes: ['au'],
            locationBias: {
              circle: {
                center: { latitude: bias.latitude, longitude: bias.longitude },
                radius: BIAS_RADIUS_M,
              },
            },
            sessionToken: sessionToken.current,
          }),
        });

        if (!response.ok) throw new Error(`Places returned ${response.status}`);

        const data = await response.json();
        if (cancelled) return;

        const parsed: PlaceSuggestion[] = (data.suggestions ?? [])
          .map((item: any) => item.placePrediction)
          .filter(Boolean)
          .map((prediction: any) => ({
            placeId: prediction.placeId,
            primaryText: prediction.structuredFormat?.mainText?.text ?? '',
            secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
          }));

        setSuggestions(parsed);
      } catch {
        if (!cancelled) {
          setError('Search unavailable');
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, bias.latitude, bias.longitude]);

  /** Fetches coordinates for a chosen suggestion and closes the billing session. */
  const resolvePlace = useCallback(async (placeId: string): Promise<ResolvedPlace> => {
    if (!API_KEY) throw new Error('Place search is not configured');

    const url = `${DETAILS_URL}/${placeId}?sessionToken=${sessionToken.current}`;

    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        // Required. Also controls cost - request only what you use, since
        // extra fields can move the call into a pricier tier.
        'X-Goog-FieldMask': 'location,displayName,formattedAddress',
      },
    });

    if (!response.ok) throw new Error('Could not load that place');

    const data = await response.json();

    // Session is spent - the next search starts a new billable group.
    sessionToken.current = Crypto.randomUUID();
    setQuery('');
    setSuggestions([]);

    return {
      name: data.displayName?.text ?? data.formattedAddress ?? 'Selected location',
      coordinate: {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
      },
    };
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setError(null);
  }, []);

  return { query, setQuery, suggestions, loading, error, resolvePlace, clear };
}
