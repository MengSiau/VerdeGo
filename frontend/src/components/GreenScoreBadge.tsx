import { StyleSheet, Text, View } from 'react-native';

import type { GreenScoreGrade } from '@/src/screens/PostRide/PostRideContext';
import { colors, fontFamily, fontSize, radius } from '@/src/theme';

const GRADE_COLORS: Record<GreenScoreGrade, string> = {
  'A+': colors.brand.verde500,
  A: '#4ade80',
  B: colors.accent.amber400,
  C: '#fb923c',
};

type GreenScoreBadgeProps = {
  grade: GreenScoreGrade;
  size?: number;
};

// Letter-grade badge from design-system.json's greenScoreBadge token.
export function GreenScoreBadge({ grade, size = 56 }: GreenScoreBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: radius.xl, backgroundColor: GRADE_COLORS[grade] },
      ]}>
      <Text style={[styles.label, { fontSize: size * 0.36 }]}>{grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.headingExtrabold,
    color: colors.neutral.white,
  },
});
