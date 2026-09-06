import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type SecondaryButtonProps = {
  label: string;
  icon?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  /** 'destructive' = destructiveOutline token (border-red-200, text-red-500) - e.g. Decline, Cancel Ride. */
  variant?: 'default' | 'destructive';
};

// Standard app-wide secondary/outline button: white bg, border-2, on a white/light screen.
export function SecondaryButton({ label, icon, onPress, variant = 'default' }: SecondaryButtonProps) {
  const isDestructive = variant === 'destructive';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDestructive ? styles.buttonDestructive : styles.buttonDefault,
        pressed && styles.pressed,
      ]}>
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, isDestructive ? styles.labelDestructive : styles.labelDefault]}>
          {label}
        </Text>
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
  buttonDefault: {
    borderColor: colors.neutral.gray200,
  },
  buttonDestructive: {
    borderColor: '#fecaca',
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
  labelDefault: {
    color: colors.neutral.gray700,
  },
  labelDestructive: {
    color: colors.semantic.danger,
  },
});
