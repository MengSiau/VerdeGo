import { useVehicles } from '@/src/data/VehiclesStore';
import { getGreenScore } from '@/src/utils/greenScore';
import { calculateRideEmissionsKg } from '@/src/utils/rideEmissions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createRide } from '@/src/api/rides';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';
import { ExpandableRouteMap } from '@/src/components/ExpandedRouteMap';
import { useRoute } from '@/src/hooks/UseRoute';

import { buildDepartureIso, formatFullDate, toIsoDate } from '../dateUtils';
import { calculateFinalFarePerPassenger } from '../fareCalculator';
import { usePostRideDraft } from '../PostRideContext';

function toStationAbbrev(place: string) {
  return place.replace(/ Station$/, ' Stn');
}

export function PostConfirm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft } = usePostRideDraft();
  const [submitting, setSubmitting] = useState(false);

  const pickup = toStationAbbrev(draft.pickup ?? 'Glen Waverley Station');
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
  const co2Total = calculateRideEmissionsKg(factor, distanceKm);
  const greenScore =
    factor != null && Number.isFinite(factor) && factor >= 0
      ? { grade: getGreenScore(factor) }
      : undefined;

  const hourDisplay = draft.hour ? String(parseInt(draft.hour, 10)) : '8';
  const timeDisplay = `${hourDisplay}:${draft.minute ?? '15'} ${draft.period ?? 'AM'}`;
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
      draft.durationMinutes === undefined ||
      !origin ||
      !destination
    ) {
      Alert.alert(
        'Missing ride details',
        'Pick both locations and a saved vehicle with an emissions factor before posting.'
      );
      return;
    }

    const departureDateIso = draft.departureDate ?? toIsoDate(new Date());
    const departureIso = buildDepartureIso(departureDateIso, draft.hour ?? '08', draft.minute ?? '15', draft.period ?? 'AM');

    setSubmitting(true);
    try {
      await createRide({
        vehicle_id: vehicle.vehicle_id,
        origin_lat: origin.latitude,
        origin_lng: origin.longitude,
        destination_lat: destination.latitude,
        destination_lng: destination.longitude,
        departure_time: departureIso,
        price_per_passenger: Number(fare.toFixed(2)),
        seats_available: seats,
        distance_km: distanceKm,
        duration_min: draft.durationMinutes,
        co2_estimate_kg: Number(co2Total.toFixed(2)),
      });
      router.push('/home');
    } catch (e) {
      Alert.alert('Unable to post ride', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
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
          <SummaryRow label="Date" value={draft.date ?? formatFullDate(new Date())} />
          <SummaryRow label="Time" value={timeDisplay} />
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

      <View style={styles.actions}>
        <PrimaryButton
          label={submitting ? 'Posting Ride...' : 'Post Ride'}
          disabled={loading || submitting || co2Total === undefined || distanceKm === undefined}
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
  actions: {
    marginTop: 16,
  },
  actionGap: {
    height: 12,
  },
});