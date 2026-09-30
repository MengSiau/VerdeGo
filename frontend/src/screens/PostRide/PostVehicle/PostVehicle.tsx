import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GreenScoreBadge } from '@/src/components/GreenScoreBadge';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { SegmentedOptions } from '@/src/components/SegmentedOptions';
import { TextField } from '@/src/components/TextField';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

import { usePostRideDraft, type FuelType, type GreenScoreResult } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

// Stands in for a real saved-vehicle lookup once accounts/backend exist.
const DEMO_VEHICLE = { make: 'Toyota', model: 'Corolla', year: '2019', fuelType: 'hybrid' as FuelType };

const FUEL_TYPE_OPTIONS: { label: string; value: FuelType }[] = [
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Electric', value: 'electric' },
];

// Demo Carbon Interface results, keyed by fuel type - no real API wired up yet.
const FUEL_RESULTS: Record<FuelType, GreenScoreResult> = {
  petrol: { grade: 'C', co2Per100km: 9.2, percentBelowAverage: -8 },
  diesel: { grade: 'B', co2Per100km: 7.6, percentBelowAverage: 10 },
  hybrid: { grade: 'A+', co2Per100km: 1.48, percentBelowAverage: 68 },
  electric: { grade: 'A+', co2Per100km: 0.2, percentBelowAverage: 95 },
};

const EMISSIONS_SCALE_MAX = 5; // kg CO2 / 100km treated as the "high emissions" end of the bar

export function PostVehicle() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();

  const make = draft.vehicleMake ?? DEMO_VEHICLE.make;
  const model = draft.vehicleModel ?? DEMO_VEHICLE.model;
  const year = draft.vehicleYear ?? DEMO_VEHICLE.year;
  const fuelType = draft.fuelType ?? DEMO_VEHICLE.fuelType;
  const result = draft.greenScore;

  const handleCalculate = () => {
    updateDraft({ greenScore: FUEL_RESULTS[fuelType] });
  };

  const emissionsRatio = result ? Math.min(1, result.co2Per100km / EMISSIONS_SCALE_MAX) : 0;
  const belowAverage = result ? result.percentBelowAverage >= 0 : false;

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Vehicle & Green Score" step={3} />

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          Your vehicle details help us calculate your <Text style={styles.subtitleBold}>Green Score</Text>{' '}
          using Carbon Interface data.
        </Text>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField label="Make" value={make} onChangeText={(text) => updateDraft({ vehicleMake: text })} />
          </View>
          <View style={styles.rowItem}>
            <TextField
              label="Model"
              value={model}
              onChangeText={(text) => updateDraft({ vehicleModel: text })}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <TextField
            label="Year"
            keyboardType="number-pad"
            value={year}
            onChangeText={(text) => updateDraft({ vehicleYear: text })}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Fuel Type</Text>
          <View style={styles.fuelTypeWrap}>
            <SegmentedOptions
              options={FUEL_TYPE_OPTIONS}
              value={fuelType}
              onChange={(value) => updateDraft({ fuelType: value, greenScore: undefined })}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <SecondaryButton
            variant="accent"
            label="Calculate Green Score"
            icon={<Ionicons name="leaf-outline" size={18} color={colors.brand.verde700} />}
            onPress={handleCalculate}
          />
        </View>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Green Score Result</Text>
              <Text style={styles.resultSource}>via Carbon Interface</Text>
            </View>

            <View style={styles.resultBody}>
              <GreenScoreBadge grade={result.grade} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultValue}>
                  {result.co2Per100km} kg CO<Text style={styles.subscript}>2</Text>
                </Text>
                <Text style={styles.resultMeta}>
                  per 100 km · {year} {make} {model} {fuelTypeLabel(fuelType)}
                </Text>
                <Text style={[styles.resultComparison, !belowAverage && styles.resultComparisonWorse]}>
                  {Math.abs(result.percentBelowAverage)}%{' '}
                  {belowAverage ? 'below average car ✓' : 'above average car'}
                </Text>
              </View>
            </View>

            <View style={styles.emissionsTrack}>
              <View style={[styles.emissionsFill, { width: `${emissionsRatio * 100}%` }]} />
            </View>
            <View style={styles.emissionsLabels}>
              <Text style={styles.emissionsLabelText}>Low emissions</Text>
              <Text style={styles.emissionsLabelText}>High emissions</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Next: Fare" onPress={() => router.push('/post-fare')} />
      </View>
    </View>
  );
}

function fuelTypeLabel(fuelType: FuelType) {
  return fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
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
