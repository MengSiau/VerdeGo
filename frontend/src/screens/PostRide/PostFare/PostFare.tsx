import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

import {
  DEMO_DISTANCE_KM,
  FUEL_CONSUMPTION_L_PER_100KM,
  PLATFORM_FEE,
  RACV_PETROL_PRICE_PER_L,
  calculateFinalFarePerPassenger,
  calculateFuelCost,
} from '../fareCalculator';
import { usePostRideDraft } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

const MAX_ADJUSTMENT_PERCENT = 20;

export function PostFare() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();

  const fuelType = draft.fuelType ?? 'hybrid';
  const seats = draft.seats ?? 2;
  const greenScore = draft.greenScore;
  const adjustmentPercent = draft.fareAdjustmentPercent ?? 0;

  const fuelConsumption = FUEL_CONSUMPTION_L_PER_100KM[fuelType];
  const fuelCost = calculateFuelCost(fuelType);
  const finalFarePerPassenger = calculateFinalFarePerPassenger(fuelType, adjustmentPercent);

  const co2Total = greenScore ? (greenScore.co2Per100km * DEMO_DISTANCE_KM) / 100 : undefined;
  const co2VsAverage =
    greenScore && co2Total !== undefined
      ? co2Total / (1 - greenScore.percentBelowAverage / 100) - co2Total
      : undefined;
  const co2BelowAverage = co2VsAverage !== undefined ? co2VsAverage >= 0 : false;

  const setAdjustment = (percent: number) => updateDraft({ fareAdjustmentPercent: Math.round(percent) });

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Fare Preview" step={4} />

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.fareCard}>
          <Text style={styles.sectionLabel}>Fare Calculation</Text>

          <FareRow label="Distance" value={`${DEMO_DISTANCE_KM} km`} />
          <FareRow label="Petrol price (RACV live)" value={`$${RACV_PETROL_PRICE_PER_L.toFixed(2)}/L`} />
          <FareRow label="Fuel consumption" value={`${fuelConsumption.toFixed(1)} L/100km`} />
          <FareRow label="Fuel cost" value={`$${fuelCost.toFixed(2)}`} />
          <FareRow label="VerdeGo platform fee" value={`$${PLATFORM_FEE.toFixed(2)}`} />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Per Passenger</Text>
            <Text style={styles.totalValue}>${finalFarePerPassenger.toFixed(2)}</Text>
          </View>

          <View style={styles.adjustSection}>
            <Slider
              style={styles.slider}
              minimumValue={-MAX_ADJUSTMENT_PERCENT}
              maximumValue={MAX_ADJUSTMENT_PERCENT}
              step={1}
              value={adjustmentPercent}
              minimumTrackTintColor={colors.brand.verde500}
              maximumTrackTintColor={colors.neutral.gray200}
              thumbTintColor={colors.brand.verde600}
              onValueChange={setAdjustment}
            />
            <View style={styles.sliderScaleRow}>
              <Text style={styles.sliderScaleText}>-20%</Text>
              <Text style={styles.sliderScaleText}>+20%</Text>
            </View>
            <View style={styles.adjustmentIndicator}>
              <Text style={styles.adjustmentText}>
                {adjustmentPercent === 0
                  ? 'Base fare (VerdeGo calculated)'
                  : `${adjustmentPercent > 0 ? '+' : ''}${adjustmentPercent}% ${adjustmentPercent > 0 ? 'above' : 'below'} calculated fare`}
              </Text>
              {adjustmentPercent !== 0 && (
                <Pressable onPress={() => setAdjustment(0)}>
                  <Text style={styles.resetText}>Reset</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {greenScore && co2Total !== undefined && co2VsAverage !== undefined && (
          <View style={styles.greenScoreBanner}>
            <Ionicons name="leaf" size={18} color={colors.brand.verde600} />
            <View style={styles.greenScoreTextWrap}>
              <Text style={styles.greenScoreHeading}>
                {greenScore.grade} Green Score · {co2Total.toFixed(2)} kg CO
                <Text style={styles.subscript}>2</Text> total
              </Text>
              <Text style={styles.greenScoreBody}>
                {co2BelowAverage ? 'Saving' : 'Emitting'} {Math.abs(co2VsAverage).toFixed(2)} kg vs solo
                drive · {seats} passenger{seats === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Review & Post Ride" onPress={() => router.push('/post-confirm')} />
      </View>
    </View>
  );
}

function FareRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fareRow}>
      <Text style={styles.fareRowLabel}>{label}</Text>
      <Text style={styles.fareRowValue}>{value}</Text>
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
  fareCard: {
    borderWidth: 2,
    borderColor: colors.brand.verde200,
    borderRadius: radius['3xl'],
    padding: 16,
  },
  sectionLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fareRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareRowLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  fareRowValue: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: colors.neutral.gray100,
  },
  totalRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  totalValue: {
    fontFamily: fontFamily.headingExtrabold,
    fontSize: fontSize['2xl'],
    color: colors.brand.verde600,
  },
  adjustSection: {
    marginTop: 16,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sliderScaleRow: {
    marginTop: -6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderScaleText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray400,
  },
  adjustmentIndicator: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustmentText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  resetText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
    textDecorationLine: 'underline',
  },
  greenScoreBanner: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.brand.verde50,
  },
  greenScoreTextWrap: {
    flex: 1,
  },
  greenScoreHeading: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  subscript: {
    fontSize: fontSize['2xs'],
  },
  greenScoreBody: {
    marginTop: 2,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.brand.verde600,
  },
  actions: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
