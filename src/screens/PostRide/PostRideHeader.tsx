import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/src/components/ProgressBar';
import { colors, fontFamily, fontSize, gradients, screenPaddingX } from '@/src/theme';

const TOTAL_STEPS = 4;

type PostRideHeaderProps = {
  title: string;
  step: number;
};

export function PostRideHeader({ title, step }: PostRideHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient colors={gradients.headerHero} style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.neutral.white} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.stepLabel}>
          {step} / {TOTAL_STEPS}
        </Text>
      </View>
      <View style={styles.progressWrap}>
        <ProgressBar step={step} totalSteps={TOTAL_STEPS} onHeader />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: screenPaddingX.standard,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.neutral.white,
  },
  stepLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  progressWrap: {
    marginTop: 16,
  },
});
