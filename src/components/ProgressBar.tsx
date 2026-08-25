import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, gradients, radius } from '@/src/theme';

type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

// Thin rounded progress indicator used in multi-step flows (e.g. profile setup wizard).
export function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const progress = totalSteps > 0 ? Math.min(Math.max(step / totalSteps, 0), 1) : 0;

  return (
    <View style={styles.track}>
      <LinearGradient
        colors={gradients.primaryCTA}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${progress * 100}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray100,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
