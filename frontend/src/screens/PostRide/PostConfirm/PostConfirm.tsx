import { useVehicles } from '@/src/data/VehiclesStore';
import { getGreenScore } from '@/src/utils/greenScore';
import { calculateRideEmissionsKg } from '@/src/utils/rideEmissions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpandableRouteMap } from '@/src/components/ExpandedRouteMap';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { useRidesStore } from '@/src/data/RidesStore';
import { useRoute } from '@/src/hooks/UseRoute';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';
import { formatRideDate, formatRideTime } from '@/src/utils/datetime';

import { calculateFinalFarePerPassenger } from '../fareCalculator';
import { usePostRideDraft } from '../PostRideContext';


// Only used if the route lookup never produced a duration - the ride still
// needs a drop-off estimate to display.
const FALLBACK_DURATION_MINUTES = 18;

function toStationAbbrev(place: string) {
  return place.replace(/ Station$/, ' Stn');
}

export function PostConfirm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft } = usePostRideDraft();
  const { postRide } = useRidesStore();

  const [posting, setPosting] = useState(false);

  const pickupFull = draft.pickup ?? 'Selected location';
  const pickup = toStationAbbrev(pickupFull);
  const destinationFull = draft.destination ?? 'Monash University Clayton Campus';
  const destinationLabel = toStationAbbrev(destinationFull);
  const fuelType = draft.fuelType ?? 'hybrid';
  const seats = draft.seats ?? 2;
  const adjustmentPercent = draft.fareAdjustmentPercent ?? 0;
  const { vehicles, loading } = useVehicles();
  const vehicle = vehicles.find((item) => item.vehicle_id === draft.vehicleId);
  const model = vehicle?.vehicle_models;
  const factor = model?.co2_g_per_km;

  // Both ends come from the draft, so a from-campus ride draws the same way
  // round as a to-campus one.
  const origin =
    draft.pickupLat != null && draft.pickupLng != null
      ? { latitude: draft.pickupLat, longitude: draft.pickupLng }
      : null;

  const destination =
    draft.destinationLat != null && draft.destinationLng != null
      ? { latitude: draft.destinationLat, longitude: draft.destinationLng }
      : null;

  // Already fetched and cached by PostVehicle for this same coordinate pair, so
  // this is a cache read rather than a second billed request. We only need the
  // path here - distance and duration were written to the draft upstream.
  const { route } = useRoute(origin, destination);

  const distanceKm = draft.distanceKm;
  const durationMinutes = draft.durationMinutes ?? FALLBACK_DURATION_MINUTES;
  const co2Total = calculateRideEmissionsKg(factor, distanceKm);
  const greenScore =
    factor != null && Number.isFinite(factor) && factor >= 0
      ? { grade: getGreenScore(factor) }
      : undefined;

  // One timestamp, set in PostDatetime. Every date and time below is formatted
  // from it rather than reassembled from separate fields.
  const departure = draft.departureIso ? new Date(draft.departureIso) : null;

  const vehicleDisplay = model
    ? `${model.year} ${model.make} ${model.model} (${vehicle?.license_plate})`
    : 'Select a saved vehicle';
  const fare = calculateFinalFarePerPassenger(fuelType, adjustmentPercent, distanceKm ?? 0);

  const handlePostRide = async () => {
    // Coordinates are guarded rather than defaulted - a `?? 0` fallback would
    // post a ride with markers in the Atlantic rather than failing visibly.
    if (
      loading ||
      !vehicle ||
      co2Total === undefined ||
      distanceKm === undefined ||
      !origin ||
      !destination ||
      !departure
    ) {
      Alert.alert(
        'Missing ride details',
        'Pick both locations, a departure time, and a saved vehicle with an emissions factor before posting.'
      );
      return;
    }

    setPosting(true);

    try {
      await postRide(
        {
          vehicle_id: vehicle.vehicle_id,
          origin_lat: origin.latitude,
          origin_lng: origin.longitude,
          destination_lat: destination.latitude,
          destination_lng: destination.longitude,
          origin_label: pickupFull,
          destination_label: destinationFull,
          departure_time: departure.toISOString(),
          price_per_passenger: fare,
          seats_available: seats,
          // route_estimates has NOT NULL on all three. The client already has
          // them from the Routes API and the vehicle's emissions factor.
          distance_km: distanceKm,
          duration_min: durationMinutes,
          co2_estimate_kg: co2Total,
        },
        formatRideDate(departure),
      );

      router.push('/home');
    } catch (e) {
      // The API returns a generic message by design; the detail is in the
      // Flask console.
      Alert.alert('Could not post ride', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard this ride?',
      "This will discard everything you've entered and return you to the feed.",
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          // Leaving the (post-ride) route group entirely unmounts PostRideProvider,
          // so the draft is naturally discarded - no explicit reset needed.
          onPress: () => router.replace('/home'),
        },
      ]
    );
  };

  return (
    <View style={[styles.fill, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.neutral.gray900} />
        </Pressable>
        <Text style={styles.title}>Review & Post</Text>
      </View>

      <View style={styles.summaryCard}>
        <ExpandableRouteMap
          origin={origin}
          destination={destination}
          path={route?.path}
          originLabel={pickup}
          destinationLabel={destinationLabel}
          distanceKm={distanceKm}
          durationMinutes={draft.durationMinutes}
        />

        <View style={styles.rows}>
          <SummaryRow label="Date" value={departure ? formatRideDate(departure) : 'Not set'} />
          <SummaryRow label="Time" value={departure ? formatRideTime(departure) : 'Not set'} />
          <SummaryRow label="Seats" value={`${seats} available`} />
          <SummaryRow
            label="Distance"
            value={distanceKm === undefined ? 'Not calculated' : `${distanceKm} km`}
          />
          <SummaryRow label="Vehicle" value={vehicleDisplay} />
          <SummaryRow label="Fare per passenger" value={`$${fare.toFixed(2)}`} />
          <SummaryRow
            label="Green Score"
            value={
              greenScore && co2Total !== undefined
                ? `${greenScore.grade} · ${co2Total.toFixed(2)} kg CO2e`
                : 'Not calculated'
            }
            last
          />
        </View>
      </View>

      <View style={styles.termsBox}>
        <Text style={styles.termsText}>
          By posting, you agree to VerdeGo&apos;s <Text style={styles.termsLink}>Terms of Service</Text> and
          confirm you hold a valid Australian driver&apos;s licence.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label={posting ? 'Posting…' : 'Post Ride'}
          disabled={
            posting || loading || co2Total === undefined || distanceKm === undefined || !departure
          }
          onPress={handlePostRide}
        />
        <View style={styles.actionGap} />
        <SecondaryButton variant="destructive" label="Cancel Ride" onPress={handleCancel} />
      </View>
    </View>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
  },
  summaryCard: {
    marginTop: 20,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    overflow: 'hidden',
  },
  rows: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  rowLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  rowValue: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  termsBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.gray50,
  },
  termsText: {
    textAlign: 'center',
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: fontFamily.headingSemibold,
    color: colors.brand.verde600,
  },
  actions: {
    marginTop: 16,
  },
  actionGap: {
    height: 12,
  },
});