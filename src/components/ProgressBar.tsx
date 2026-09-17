import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, gradients, radius } from '@/src/theme';

type ProgressBarProps = {
  step: number;
  totalSteps: number;
  /** Solid white fill on a translucent-white track, for use on a colored hero header. */
  onHeader?: boolean;
};

// Thin rounded progress indicator used in multi-step flows (e.g. profile setup, post-a-ride wizard).
export function ProgressBar({ step, totalSteps, onHeader }: ProgressBarProps) {
  const progress = totalSteps > 0 ? Math.min(Math.max(step / totalSteps, 0), 1) : 0;

  return (
    <View style={[styles.track, onHeader ? styles.trackOnHeader : styles.trackDefault]}>
      {onHeader ? (
        <View style={[styles.fill, styles.fillOnHeader, { width: `${progress * 100}%` }]} />
      ) : (
        <LinearGradient
          colors={gradients.primaryCTA}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${progress * 100}%` }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  trackDefault: {
    backgroundColor: colors.neutral.gray100,
  },
  trackOnHeader: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  fillOnHeader: {
    backgroundColor: colors.neutral.white,
  },
});
