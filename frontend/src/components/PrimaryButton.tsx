import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import type { ReactNode } from "react";

import { fontFamily, radius, tapTarget } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type PrimaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  icon?: ReactNode;
  /** Blocks presses and dims the button. Used for in-progress async actions. */
  disabled?: boolean;
};

// Standard app-wide primary CTA: solid brand colour, full-width, min height from tapTarget.
export function PrimaryButton({ label, onPress, icon, disabled = false }: PrimaryButtonProps) {
  const { styles } = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={styles.label} maxFontSizeMultiplier={1.6}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    button: {
      minHeight: tapTarget.primaryButtonHeight,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: radius["2xl"],
      backgroundColor: t.colors.brand,
      // Outline keeps the button visible in high contrast (esp. green on black)
      borderWidth: 2,
      borderColor: t.colors.brand,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
      shadowOpacity: 0,
      elevation: 0,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    label: {
      flexShrink: 1,
      textAlign: "center",
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.onBrand,
    },
  });