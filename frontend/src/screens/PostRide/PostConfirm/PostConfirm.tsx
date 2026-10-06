import { useVehicles } from '@/src/data/VehiclesStore';
import { getGreenScore } from '@/src/utils/greenScore';
import { calculateRideEmissionsKg } from '@/src/utils/rideEmissions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { CURRENT_USER_ID, CURRENT_USER_NAME } from '@/src/data/currentUser';
import { useRidesStore } from '@/src/data/RidesStore';
import type { Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, mapBg, radius, screenPaddingX } from '@/src/theme';

import { calculateFinalFarePerPassenger } from '../fareCalculator';
import { usePostRideDraft, POST_RIDE_DISTANCE_KM } from '../PostRideContext';

const DESTINATION_LABEL = 'Monash Clayton';
const FULL_DESTINATION = 'Monash Clayton Campus';
const POSTED_RIDE_DURATION_MINUTES = 18; // Placeholder until route duration is available.

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
  return `${dow}, ${day} ${month} 2025`;
}

export function PostConfirm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft } = usePostRideDraft();
  const { postRide } = useRidesStore();

  const pickup = toStationAbbrev(draft.pickup ?? 'Glen Waverley Station');
  const fuelType = draft.fuelType ?? 'hybrid';
  const seats = draft.seats ?? 2;
  const adjustmentPercent = draft.fareAdjustmentPercent ?? 0;
  const { vehicles, loading } = useVehicles();
  const vehicle = vehicles.find((item) => item.vehicle_id === draft.vehicleId);
  const model = vehicle?.vehicle_models;
  const factor = model?.co2_g_per_km;
  const distanceKm = POST_RIDE_DISTANCE_KM;
  const co2Total = calculateRideEmissionsKg(factor, distanceKm);
  const greenScore = factor != null && Number.isFinite(factor) && factor >= 0 ? { grade: getGreenScore(factor) } : undefined;

  const hourDisplay = draft.hour ? String(parseInt(draft.hour, 10)) : '8';
  const timeDisplay = `${hourDisplay}:${draft.minute ?? '15'} ${draft.period ?? 'AM'}`;
  const vehicleDisplay = model ? `${model.year} ${model.make} ${model.model} (${vehicle?.license_plate})` : 'Select a saved vehicle';
  const fare = calculateFinalFarePerPassenger(fuelType, adjustmentPercent, distanceKm ?? 0);

  const handlePostRide = () => {
    if (loading || !vehicle || co2Total === undefined || distanceKm === undefined) {
      Alert.alert('Vehicle and distance required', 'Select a saved vehicle with an emissions factor and enter a positive journey distance.');
      return;
    }
    // TODO: submit the completed ride draft to backend once it exists - for now this just
    // adds the ride to the shared in-memory store so it shows up in Home/My Rides.
    const { hours, minutes } = to24Hour(draft.hour ?? '08', draft.minute ?? '15', draft.period ?? 'AM');
    const dropoff = addMinutes(hours, minutes, POSTED_RIDE_DURATION_MINUTES);

    const newRide: Ride = {
      id: `posted-${Date.now()}`,
      driverId: CURRENT_USER_ID,
      driverName: CURRENT_USER_NAME,
      rating: 5,
      ratingCount: 0,
      pickup: draft.pickup ?? 'Glen Waverley Station',
      destination: FULL_DESTINATION,
      date: draft.date ?? 'Wed, Aug 13',
      departureTime: timeDisplay,
      dropoffTimeEstimate: to12HourDisplay(dropoff.hours, dropoff.minutes),
      distanceKm,
      vehicleId: vehicle.vehicle_id,
      seats,
      durationMinutes: POSTED_RIDE_DURATION_MINUTES,
      price: fare,
      co2SavedKg: 0,
      co2EstimateKg: co2Total,
      confirmedPassengers: [],
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
        {/* TODO: tapping this will open an expanded map view once real map integration exists. */}
        <Pressable style={styles.mapPreview}>
          <Svg width="100%" height="100%" viewBox="0 0 100 60" style={StyleSheet.absoluteFill}>
            <Path
              d="M15 48 Q 50 8 85 22"
              stroke={colors.brand.verde600}
              strokeWidth={2}
              strokeDasharray="4,3"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>

          <View style={[styles.marker, styles.markerStart]}>
            <View style={styles.pickupDot} />
          </View>
          <View style={[styles.pill, styles.pillStart]}>
            <Text style={styles.pillText}>{pickup}</Text>
          </View>

          <View style={[styles.marker, styles.markerEnd]}>
            <Ionicons name="location" size={16} color={colors.brand.verde600} />
          </View>
          <View style={[styles.pill, styles.pillEnd]}>
            <Text style={styles.pillText}>{DESTINATION_LABEL}</Text>
          </View>
        </Pressable>

        <View style={styles.rows}>
          <SummaryRow label="Date" value={toFullDateDisplay(draft.date)} />
          <SummaryRow label="Time" value={timeDisplay} />
          <SummaryRow label="Seats" value={`${seats} available`} />
          <SummaryRow label="Distance" value={`${distanceKm ?? 0} km`} />
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
        <PrimaryButton label="Post Ride" disabled={loading || co2Total === undefined} onPress={handlePostRide} />
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
  mapPreview: {
    height: 160,
    backgroundColor: mapBg,
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerStart: {
    left: '11%',
    top: '72%',
  },
  markerEnd: {
    left: '81%',
    top: '28%',
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pillStart: {
    left: 12,
    top: 12,
  },
  pillEnd: {
    left: '55%',
    top: '48%',
  },
  pillText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.neutral.gray800,
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
