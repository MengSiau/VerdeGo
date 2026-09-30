import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type SecondaryButtonVariant = 'default' | 'destructive' | 'accent';

type SecondaryButtonProps = {
  label: string;
  icon?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  /**
   * 'destructive' = destructiveOutline token (border-red-200, text-red-500) - e.g. Decline, Cancel Ride.
   * 'accent' = green-outline action - e.g. Calculate Green Score.
   */
  variant?: SecondaryButtonVariant;
};

const VARIANT_STYLES: Record<SecondaryButtonVariant, { border: object; label: object }> = {
  default: { border: { borderColor: colors.neutral.gray200 }, label: { color: colors.neutral.gray700 } },
  destructive: { border: { borderColor: '#fecaca' }, label: { color: colors.semantic.danger } },
  accent: { border: { borderColor: colors.brand.verde500 }, label: { color: colors.brand.verde700 } },
};

// Standard app-wide secondary/outline button: white bg, border-2, on a white/light screen.
export function SecondaryButton({ label, icon, onPress, variant = 'default' }: SecondaryButtonProps) {
  const palette = VARIANT_STYLES[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, palette.border, pressed && styles.pressed]}>
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, palette.label]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tapTarget.secondaryButtonHeight,
    borderRadius: radius['2xl'],
    borderWidth: 2,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
  },
});
