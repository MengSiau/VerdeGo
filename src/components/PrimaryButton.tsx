import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, gradients, radius, tapTarget } from '@/src/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  icon?: ReactNode;
  /** Blocks presses and dims the button used for in progress async actions. */
  disabled?: boolean;
};

// Standard app-wide primary CTA: gradients.primaryCTA background, full-width, 56px min height.
export function PrimaryButton({ label, onPress, icon, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient
        colors={gradients.primaryCTA}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}>
        <View style={styles.content}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
},
  disabled: {
    opacity: 0.6,
},
});
