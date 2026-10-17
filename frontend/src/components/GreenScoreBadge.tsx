import { StyleSheet, Text, View } from 'react-native';

import type { GreenScoreGrade } from '@/src/utils/greenScore';
import { colors, fontFamily, radius } from '@/src/theme';
import { useTheme } from '@/src/theme/useTheme';

// Grade colours are meaningful (green = best, orange = worst), so they stay the same
// in every theme. They are all bright, so the letter is dark rather than white.
const GRADE_COLORS: Record<GreenScoreGrade, string> = {
  'A+': colors.brand.verde500,
  A: '#4ade80',
  B: colors.accent.amber400,
  C: '#fb923c',
};

const GRADE_TEXT = '#111827';

type GreenScoreBadgeProps = {
  grade: GreenScoreGrade;
  size?: number;
};

// Letter-grade badge from design-system.json's greenScoreBadge token.
export function GreenScoreBadge({ grade, size = 56 }: GreenScoreBadgeProps) {
  const { colors: themeColors } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`Green score ${grade}`}
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: radius.xl,
          backgroundColor: GRADE_COLORS[grade],
          borderColor: themeColors.border,
        },
      ]}>
      {/* Sized from the badge, so it must not grow with Large text or it overflows */}
      <Text maxFontSizeMultiplier={1} style={[styles.label, { fontSize: size * 0.36 }]}>
        {grade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  label: {
    fontFamily: fontFamily.headingExtrabold,
    color: GRADE_TEXT,
  },
});