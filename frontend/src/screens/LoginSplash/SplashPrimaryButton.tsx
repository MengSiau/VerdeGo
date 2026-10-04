import { Pressable, StyleSheet, Text, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type SplashPrimaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export function SplashPrimaryButton({ label, onPress }: SplashPrimaryButtonProps) {
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
    minHeight: tapTarget.primaryButtonHeight,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.white,
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
    color: colors.brand.verde700,
  },
});
