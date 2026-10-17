import { useVehicles } from '@/src/data/VehiclesStore';
import { getGreenScore } from '@/src/utils/greenScore';
import { calculateRideEmissionsKg } from '@/src/utils/rideEmissions';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { fontFamily, radius, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

import {
  FUEL_CONSUMPTION_L_PER_100KM,
  PLATFORM_FEE,
  RACV_PETROL_PRICE_PER_L,
  calculateFinalFarePerPassenger,
  calculateFuelCost,
} from '../fareCalculator';
import { usePostRideDraft} from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

const MAX_ADJUSTMENT_PERCENT = 20;

export function PostFare() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { draft, updateDraft } = usePostRideDraft();

  const fuelType = draft.fuelType ?? 'hybrid';
  const { vehicles, loading } = useVehicles();
  const vehicle = vehicles.find((item) => item.vehicle_id === draft.vehicleId);
  const model = vehicle?.vehicle_models;
  const factor = model?.co2_g_per_km;
  const distanceKm = draft.distanceKm;
  const co2Total = calculateRideEmissionsKg(factor, distanceKm);
  const greenScore = factor != null && Number.isFinite(factor) && factor >= 0 ? { grade: getGreenScore(factor) } : undefined;
  const adjustmentPercent = draft.fareAdjustmentPercent ?? 0;

  const fuelConsumption = FUEL_CONSUMPTION_L_PER_100KM[fuelType];
  const fuelCost = calculateFuelCost(fuelType, distanceKm ?? 0);
  const finalFarePerPassenger = calculateFinalFarePerPassenger(fuelType, adjustmentPercent, distanceKm ?? 0);

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

          <FareRow label="Distance" value={`${distanceKm ?? 0} km`} />
          <FareRow label="Estimated fuel price" value={`$${RACV_PETROL_PRICE_PER_L.toFixed(2)}/L`} />
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
              minimumTrackTintColor={theme.colors.brand}
              maximumTrackTintColor={theme.colors.border}
              thumbTintColor={theme.colors.brand}
              accessibilityLabel="Fare adjustment percentage"
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
                <Pressable
                  onPress={() => setAdjustment(0)}
                  style={styles.resetButton}
                  accessibilityRole="button"
                  accessibilityLabel="Reset fare adjustment">
                  <Text style={styles.resetText}>Reset</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {greenScore && co2Total !== undefined && (
          <View style={styles.greenScoreBanner}>
            <Ionicons name="leaf" size={18} color={theme.colors.brand} />
            <View style={styles.greenScoreTextWrap}>
              <Text style={styles.greenScoreHeading}>
                {greenScore.grade} Green Score · {co2Total.toFixed(2)} kg CO
                <Text style={styles.subscript}>2</Text>e total
              </Text>
              <Text style={styles.greenScoreBody}>
                Based on your saved vehicle and {distanceKm} km journey.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Review & Post Ride" disabled={loading || co2Total === undefined} onPress={() => router.push('/post-confirm')} />
      </View>
    </View>
  );
}

function FareRow({ label, value }: { label: string; value: string }) {
  const { styles } = useThemedStyles(makeStyles);
  return (
    <View style={styles.fareRow}>
      <Text style={styles.fareRowLabel}>{label}</Text>
      <Text style={styles.fareRowValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    content: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 20,
    },
    fareCard: {
      borderWidth: 2,
      borderColor: t.colors.brand,
      backgroundColor: t.colors.surface,
      borderRadius: radius['3xl'],
      padding: 16,
    },
    sectionLabel: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize['2xs'],
      lineHeight: t.lineHeight(t.fontSize['2xs']),
      color: t.colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fareRow: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: 12,
    },
    fareRowLabel: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    fareRowValue: {
      flexShrink: 1,
      textAlign: 'right',
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    divider: {
      marginTop: 16,
      height: 1,
      backgroundColor: t.colors.divider,
    },
    totalRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: 12,
    },
    totalLabel: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    totalValue: {
      fontFamily: fontFamily.headingExtrabold,
      fontSize: t.fontSize['2xl'],
      lineHeight: t.lineHeight(t.fontSize['2xl']),
      color: t.colors.brand,
    },
    adjustSection: {
      marginTop: 16,
    },
    slider: {
      width: '100%',
      height: 44,
    },
    sliderScaleRow: {
      marginTop: -6,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sliderScaleText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize['2xs'],
      lineHeight: t.lineHeight(t.fontSize['2xs']),
      color: t.colors.textSecondary,
    },
    adjustmentIndicator: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    adjustmentText: {
      textAlign: 'center',
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.brand,
    },
    resetButton: {
      minHeight: 44,
      justifyContent: 'center',
    },
    resetText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textDecorationLine: 'underline',
    },
    greenScoreBanner: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 16,
      borderRadius: radius['2xl'],
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.brand,
    },
    greenScoreTextWrap: {
      flex: 1,
    },
    greenScoreHeading: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.brand,
    },
    subscript: {
      fontSize: t.fontSize['2xs'],
    },
    greenScoreBody: {
      marginTop: 2,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    actions: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 16,
      paddingBottom: 24,
      backgroundColor: t.colors.bg,
    },
  });