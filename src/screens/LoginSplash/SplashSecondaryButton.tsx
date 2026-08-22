import { Pressable, StyleSheet, Text, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type SplashSecondaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
};

// Translucent-on-color variant, used for secondary actions on a colored hero background
// (e.g. "Sign In" under the primary "Get Started" CTA on the splash screen).
export function SplashSecondaryButton({ label, onPress }: SplashSecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tapTarget.secondaryButtonHeight,
    borderRadius: radius['2xl'],
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
