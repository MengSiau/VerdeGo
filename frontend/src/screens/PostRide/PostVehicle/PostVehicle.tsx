import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ComboBox } from '@/src/components/ComboBox';
import { GreenScoreBadge } from '@/src/components/GreenScoreBadge';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { useVehicles } from '@/src/data/VehiclesStore';
import { getGreenScore } from '@/src/utils/greenScore';
import { calculateRideEmissionsKg } from '@/src/utils/rideEmissions';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';
import { usePostRideDraft } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';
import { useRoute } from '@/src/hooks/UseRoute';
import { useEffect } from 'react';


export function PostVehicle() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();
  const { vehicles, loading, error, refresh } = useVehicles();

  const vehicle = vehicles.find((item) => item.vehicle_id === draft.vehicleId);
  const factor = vehicle?.vehicle_models?.co2_g_per_km;

  // Coordinates come from step 1. Without both, there's no route to measure.
  const origin =
    draft.pickupLat != null && draft.pickupLng != null
      ? { latitude: draft.pickupLat, longitude: draft.pickupLng }
      : null;

  const destination =
    draft.destinationLat != null && draft.destinationLng != null
      ? { latitude: draft.destinationLat, longitude: draft.destinationLng }
      : null;

  const { route, loading: routeLoading, error: routeError } = useRoute(origin, destination);

  // Prefer the freshly fetched route; fall back to whatever the draft already
  // holds so going back a step doesn't re-block the flow.
  const distanceKm = route?.distanceKm ?? draft.distanceKm;

  // Persist so PostFare and PostConfirm read one agreed figure rather than
  // each deriving their own.
  useEffect(() => {
    if (route) {
      updateDraft({
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
      });
    }
  }, [route]);

  const total = calculateRideEmissionsKg(factor, distanceKm);

  const noUsableFactor =
    vehicle && (factor == null || !Number.isFinite(Number(factor)) || Number(factor) < 0);

  
  return (
    <View style={styles.fill}>
      <PostRideHeader title="Vehicle & Green Score" step={3} />
      <ScrollView
        style={styles.fill}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.subtitle}>
          Select your saved vehicle to estimate journey emissions.
        </Text>

        <View style={styles.fieldGroup}>
          <ComboBox
            label="Your vehicles"
            placeholder={loading ? 'Loading vehicles...' : 'Select a saved vehicle'}
            value={draft.vehicleId ?? null}
            disabled={loading}
            options={vehicles.map((item) => ({
              value: item.vehicle_id,
              label: item.vehicle_models
                ? `${item.vehicle_models.year} ${item.vehicle_models.make} ${item.vehicle_models.model} (${item.license_plate})`
                : item.license_plate,
            }))}
            onChange={(vehicleId) => updateDraft({ vehicleId })}
          />

          {error && (
            <>
              <Text style={styles.subtitle}>{error}</Text>
              <SecondaryButton label="Retry" onPress={() => { void refresh(); }} />
            </>
          )}

          {!loading && !error && vehicles.length === 0 && (
            <Text style={styles.subtitle}>
              Add a vehicle in My Vehicles before posting a ride.
            </Text>
          )}

          {noUsableFactor && (
            <Text style={styles.subtitle}>
              This vehicle has no usable emissions factor. Update it in My Vehicles.
            </Text>
          )}

          {/* Without a fallback distance, a routing failure has to be visible -
              otherwise the Next button is dead with no explanation. */}
          {!origin && (
            <Text style={styles.subtitle}>
              Set a pick-up location first - go back to step 1.
            </Text>
          )}

          {origin && routeError && (
            <Text style={styles.subtitle}>
              Couldn&apos;t calculate the journey distance. Check your connection and try again.
            </Text>
          )}

          {origin && routeLoading && !route && (
            <Text style={styles.subtitle}>Calculating journey distance...</Text>
          )}
        </View>

        {total !== undefined && factor != null && distanceKm != null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Estimated journey emissions</Text>
            <View style={styles.resultBody}>
              <GreenScoreBadge grade={getGreenScore(Number(factor))} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultValue}>{total.toFixed(2)} kg CO2e</Text>
                <Text style={styles.resultMeta}>
                  {factor} g/km × {distanceKm.toFixed(1)} km
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton
          label="Next: Fare"
          disabled={loading || routeLoading || total === undefined}
          onPress={() => router.push('/post-fare')}
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
  content: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 20,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.base,
    color: colors.neutral.gray500,
    lineHeight: 22,
  },
  fieldGroup: {
    marginTop: 20,
    gap: 12,
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.brand.verde50,
  },

  resultTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  resultBody: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultValue: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
  },
  resultMeta: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  actions: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    paddingBottom: 24,
  },
});