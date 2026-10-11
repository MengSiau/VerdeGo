import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type MapView from 'react-native-maps';

import { LocationPickerMap } from '@/src/components/LocationPickerMap';
import { LocationSearch } from '@/src/components/LocationSearch';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { usePlacesAutocomplete } from '@/src/hooks/UsePlacesAutocomplete';
import { useReverseGeocode } from '@/src/hooks/UseReverseGeocode';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';
import type { Coordinate } from '@/src/hooks/polyline';

import { usePostRideDraft } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

const CAMPUS_LABEL = 'Monash Clayton Campus';
const CAMPUS: Coordinate = { latitude: -37.9105, longitude: 145.1362 };

export function PostLocation() {
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();
  const mapRef = useRef<MapView>(null);

  const direction = draft.direction ?? 'to-campus';
  const isToCampus = direction === 'to-campus';

  // The map always picks whichever end of the journey isn't campus.
  const storedLat = isToCampus ? draft.pickupLat : draft.destinationLat;
  const storedLng = isToCampus ? draft.pickupLng : draft.destinationLng;

  const [centre, setCentre] = useState<Coordinate>(
    storedLat != null && storedLng != null
      ? { latitude: storedLat, longitude: storedLng }
      : CAMPUS,
  );

  // A name chosen from search wins over the geocoded one, until the user pans
  // again - at which point the pin no longer matches the searched place.
  const [chosenName, setChosenName] = useState<string | null>(null);

  const { label: geocodedLabel, loading: geocoding } = useReverseGeocode(centre);
  const places = usePlacesAutocomplete(centre);

  const pickedLabel = chosenName ?? geocodedLabel;
  const resolving = geocoding && !chosenName;

  const handleCentreChange = useCallback((coordinate: Coordinate) => {
    setCentre(coordinate);
    setChosenName(null);
  }, []);

  const handleSelectPlace = useCallback(
    async (placeId: string) => {
      try {
        const place = await places.resolvePlace(placeId);
        setChosenName(place.name);
        setCentre(place.coordinate);

        mapRef.current?.animateToRegion(
          { ...place.coordinate, latitudeDelta: 0.01, longitudeDelta: 0.01 },
          400,
        );
      } catch {
        // resolvePlace surfaces its own error state.
      }
    },
    [places],
  );

  const toggleDirection = () => {
    updateDraft({ direction: isToCampus ? 'from-campus' : 'to-campus' });
  };

  const handleConfirm = () => {
    const picked = {
      name: pickedLabel,
      lat: centre.latitude,
      lng: centre.longitude,
    };

    // Coordinates are the real data; the names are display labels.
    updateDraft(
      isToCampus
        ? {
            pickup: picked.name,
            pickupLat: picked.lat,
            pickupLng: picked.lng,
            destination: CAMPUS_LABEL,
            destinationLat: CAMPUS.latitude,
            destinationLng: CAMPUS.longitude,
          }
        : {
            pickup: CAMPUS_LABEL,
            pickupLat: CAMPUS.latitude,
            pickupLng: CAMPUS.longitude,
            destination: picked.name,
            destinationLat: picked.lat,
            destinationLng: picked.lng,
          },
    );

    router.push('/post-datetime');
  };

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Post a Ride" step={1} />

      <View style={styles.mapArea}>
        <LocationPickerMap
          mapRef={mapRef}
          initialCentre={centre}
          onCentreChange={handleCentreChange}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.searchWrap}>
          <LocationSearch
            query={places.query}
            onQueryChange={places.setQuery}
            suggestions={places.suggestions}
            loading={places.loading}
            error={places.error}
            onSelect={handleSelectPlace}
            onClear={places.clear}
            placeholder={
              isToCampus ? 'Search for a pick-up point' : 'Search for a destination'
            }
          />
        </View>

        {/* Rows are labelled From/To rather than carrying a single header, so
            the card reads in journey order whichever end is fixed. */}
        <View style={[styles.floatingCard, styles.journeyCard]}>
          <Text style={styles.rowLabel}>From</Text>
          <View style={styles.locationRow}>
            {isToCampus ? (
              <View style={styles.pickupDot} />
            ) : (
              <Ionicons name="location" size={16} color={colors.brand.verde600} />
            )}
            <Text
              style={[styles.placeText, !isToCampus && styles.campusText]}
              numberOfLines={2}>
              {isToCampus ? pickedLabel : CAMPUS_LABEL}
            </Text>
            {!isToCampus ? (
              <Text style={styles.fixedText}>Fixed</Text>
            ) : resolving ? (
              <ActivityIndicator size="small" color={colors.neutral.gray400} />
            ) : null}
          </View>

          <View style={styles.swapRow}>
            <View style={styles.divider} />
            <Pressable
              onPress={toggleDirection}
              hitSlop={8}
              style={styles.swapButton}
              accessibilityRole="button"
              accessibilityLabel={
                isToCampus
                  ? 'Switch to a ride from campus'
                  : 'Switch to a ride to campus'
              }>
              <Ionicons name="swap-vertical" size={18} color={colors.brand.verde700} />
            </Pressable>
            <View style={styles.divider} />
          </View>

          <Text style={styles.rowLabel}>To</Text>
          <View style={styles.locationRow}>
            {isToCampus ? (
              <Ionicons name="location" size={16} color={colors.brand.verde600} />
            ) : (
              <View style={styles.pickupDot} />
            )}
            <Text
              style={[styles.placeText, isToCampus && styles.campusText]}
              numberOfLines={2}>
              {isToCampus ? CAMPUS_LABEL : pickedLabel}
            </Text>
            {isToCampus ? (
              <Text style={styles.fixedText}>Fixed</Text>
            ) : resolving ? (
              <ActivityIndicator size="small" color={colors.neutral.gray400} />
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Confirm Location"
          onPress={handleConfirm}
          disabled={resolving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  mapArea: {
    flex: 1,
  },
  searchWrap: {
    position: 'absolute',
    top: 16,
    left: screenPaddingX.standard,
    right: screenPaddingX.standard,
  },
  floatingCard: {
    position: 'absolute',
    left: screenPaddingX.standard,
    right: screenPaddingX.standard,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  journeyCard: {
    bottom: 16,
  },
  rowLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
  },
  placeText: {
    flex: 1,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  campusText: {
    color: colors.brand.verde600,
  },
  fixedText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
  },
  swapRow: {
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.gray100,
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.neutral.white,
  },
});