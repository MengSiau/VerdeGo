import { useVehicles } from '@/src/data/VehiclesStore';
import { getGreenScore } from '@/src/utils/greenScore';
import { calculateRideEmissionsKg } from '@/src/utils/rideEmissions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpandableRouteMap } from '@/src/components/ExpandedRouteMap';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { CURRENT_USER_ID, CURRENT_USER_NAME } from '@/src/data/currentUser';
import { useRidesStore } from '@/src/data/RidesStore';
import type { Ride } from '@/src/data/rides';
import { useRoute } from '@/src/hooks/UseRoute';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

import { calculateFinalFarePerPassenger } from '../fareCalculator';
import { usePostRideDraft } from '../PostRideContext';


// Only used if the route lookup never produced a duration - the ride still
// needs a drop-off estimate to display.
const FALLBACK_DURATION_MINUTES = 18;

function toStationAbbrev(place: string) {
  return place.replace(/ Station$/, ' Stn');
}

function to24Hour(hour: string, minute: string, period: 'AM' | 'PM') {
  let hours = parseInt(hour, 10) % 12;
  if (period === 'PM') hours += 12;
  return { hours, minutes: parseInt(minute, 10) };
}

function addMinutes(hours: number, minutes: number, addMinutesAmount: number) {
  const totalMinutes = hours * 60 + minutes + addMinutesAmount;
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  return { hours: Math.floor(wrapped / 60), minutes: wrapped % 60 };
}

function to12HourDisplay(hours: number, minutes: number) {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

// draft.date is stored as "Wed, Aug 13" (set in PostDatetime) - reformat to the fuller
// "Wed, 13 Aug 2025" style used on this review screen.
function toFullDateDisplay(shortDate: string | undefined) {
  const fallback = 'Wed, 13 Aug 2025';
  if (!shortDate) return fallback;
  const [dow, rest] = shortDate.split(', ');
  const [month, day] = rest?.split(' ') ?? [];
  if (!dow || !month || !day) return fallback;
    return `${dow}, ${day} ${month} ${new Date().getFullYear()}`;;
}

export function PostConfirm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft } = usePostRideDraft();
  const { postRide } = useRidesStore();

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
  const durationMinutes = draft.durationMinutes ?? FALLBACK_DURATION_MINUTES;
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

  const handlePostRide = () => {
    // Coordinates are guarded rather than defaulted - a `?? 0` fallback would
    // post a ride with markers in the Atlantic rather than failing visibly.
    if (
      loading ||
      !vehicle ||
      co2Total === undefined ||
      distanceKm === undefined ||
      !origin ||
      !destination
    ) {
      Alert.alert(
        'Missing ride details',
        'Pick both locations and a saved vehicle with an emissions factor before posting.'
      );
      return;
    }

    const { hours, minutes } = to24Hour(draft.hour ?? '08', draft.minute ?? '15', draft.period ?? 'AM');
    const dropoff = addMinutes(hours, minutes, durationMinutes);

    const newRide: Ride = {
      id: `posted-${Date.now()}`,
      driverId: CURRENT_USER_ID,
      driverName: CURRENT_USER_NAME,
      rating: 5,
      ratingCount: 0,
      pickup: draft.pickup ?? 'Glen Waverley Station',
      destination: destinationFull,
      date: draft.date ?? 'Wed, Aug 13',
      departureTime: timeDisplay,
      dropoffTimeEstimate: to12HourDisplay(dropoff.hours, dropoff.minutes),
      distanceKm,
      vehicleId: vehicle.vehicle_id,
      seats,
      durationMinutes,
      price: fare,
      co2SavedKg: 0,
      co2EstimateKg: co2Total,
      confirmedPassengers: [],
      pickupLat: origin.latitude,
      pickupLng: origin.longitude,
      destinationLat: destination.latitude,
      destinationLng: destination.longitude,
    };

    postRide(newRide, draft.date ?? 'Tomorrow');
    router.push('/home');
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
          <SummaryRow label="Date" value={toFullDateDisplay(draft.date)} />
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

      <View style={styles.termsBox}>
        <Text style={styles.termsText}>
          By posting, you agree to VerdeGo&apos;s <Text style={styles.termsLink}>Terms of Service</Text> and
          confirm you hold a valid Australian driver&apos;s licence.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="Post Ride"
          disabled={loading || co2Total === undefined || distanceKm === undefined}
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