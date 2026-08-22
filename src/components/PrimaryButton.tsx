import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, gradients, radius, tapTarget } from '@/src/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
};

// Standard app-wide primary CTA: gradients.primaryCTA background, full-width, 56px min height.
export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <LinearGradient
        colors={gradients.primaryCTA}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tapTarget.primaryButtonHeight,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.base,
    color: colors.neutral.white,
  },
});
