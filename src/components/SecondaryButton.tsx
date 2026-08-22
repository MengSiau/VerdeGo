import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type SecondaryButtonProps = {
  label: string;
  icon?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
};

// Standard app-wide secondary/outline button: white bg, border-2 border-gray-200, on a white/light screen.
export function SecondaryButton({ label, icon, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.content}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tapTarget.secondaryButtonHeight,
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
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
    color: colors.neutral.gray700,
  },
});
