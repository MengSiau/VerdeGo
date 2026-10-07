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
import { usePostRideDraft, POST_RIDE_DISTANCE_KM } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

export function PostVehicle() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();
  const { vehicles, loading, error, refresh } = useVehicles();
  const vehicle = vehicles.find((item) => item.vehicle_id === draft.vehicleId);
  const factor = vehicle?.vehicle_models?.co2_g_per_km;
  const total = calculateRideEmissionsKg(factor, POST_RIDE_DISTANCE_KM);

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Vehicle & Green Score" step={3} />
      <ScrollView style={styles.fill} keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.subtitle}>Select your saved vehicle to estimate journey emissions.</Text>
        <View style={styles.fieldGroup}>
          <ComboBox label="Your vehicles" placeholder={loading ? 'Loading vehicles...' : 'Select a saved vehicle'}
            value={draft.vehicleId ?? null} disabled={loading}
            options={vehicles.map((item) => ({ value: item.vehicle_id, label: item.vehicle_models
              ? `${item.vehicle_models.year} ${item.vehicle_models.make} ${item.vehicle_models.model} (${item.license_plate})`
              : item.license_plate }))}
            onChange={(vehicleId) => updateDraft({ vehicleId })} />
          {error && <><Text style={styles.subtitle}>{error}</Text><SecondaryButton label="Retry" onPress={() => { void refresh(); }} /></>}
          {!loading && !error && vehicles.length === 0 && <Text style={styles.subtitle}>Add a vehicle in My Vehicles before posting a ride.</Text>}
          {vehicle && (factor == null || !Number.isFinite(factor) || factor < 0) && <Text style={styles.subtitle}>This vehicle has no usable emissions factor. Update it in My Vehicles.</Text>}
        </View>
        {total !== undefined && factor != null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Estimated journey emissions</Text>
            <View style={styles.resultBody}>
              <GreenScoreBadge grade={getGreenScore(factor)} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultValue}>{total.toFixed(2)} kg CO2e</Text>
                <Text style={styles.resultMeta}>{factor} g/km × {draft.distanceKm} km</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.actions}>
        <PrimaryButton label="Next: Fare" disabled={loading || total === undefined} onPress={() => { updateDraft({ distanceKm: POST_RIDE_DISTANCE_KM }); router.push('/post-fare'); }} />
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
  subtitleBold: {
    fontFamily: fontFamily.headingSemibold,
    color: colors.brand.verde700,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  fieldGroup: {
    marginTop: 20,
  },
  label: {
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  fuelTypeWrap: {
    // Fuel Type has 4 options - a touch tighter than the default gap keeps them comfortable.
  },
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.brand.verde50,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  resultSource: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray400,
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
  subscript: {
    fontSize: fontSize.xs,
  },
  resultMeta: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  resultComparison: {
    marginTop: 2,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.brand.verde600,
  },
  resultComparisonWorse: {
    color: colors.accent.amber500,
  },
  emissionsTrack: {
    marginTop: 16,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde100,
    overflow: 'hidden',
  },
  emissionsFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde500,
  },
  emissionsLabels: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emissionsLabelText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray400,
  },
  actions: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
