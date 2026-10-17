import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/src/components/ProgressBar';
import { fontFamily, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

/*
Usage: 
Defines the top header used in the post-a-ride flow. 
Displays name of step, progress bar and back btn
*/

const TOTAL_STEPS = 4;

type PostRideHeaderProps = {
  title: string;
  step: number;
};

export function PostRideHeader({ title, step }: PostRideHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);

  return (
    <LinearGradient
      colors={[...theme.colors.headerGradient]}
      style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={theme.colors.onHeader} />
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: screenPaddingX.standard,
      paddingBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.onHeader,
    },
    stepLabel: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.onHeader,
    },
    progressWrap: {
      marginTop: 16,
    },
  });