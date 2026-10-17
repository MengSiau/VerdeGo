import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

import { fontFamily, radius, tapTarget } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type SecondaryButtonVariant = "default" | "destructive" | "accent";

type SecondaryButtonProps = {
  label: string;
  icon?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  /**
   * 'default'     = neutral outline - e.g. Cancel.
   * 'destructive' = danger outline and text - e.g. Decline, Cancel Ride.
   * 'accent'      = brand outline and text - e.g. Calculate Green Score.
   */
  variant?: SecondaryButtonVariant;
};

// Standard app-wide secondary/outline button: surface bg, border-2.
export function SecondaryButton({
  label,
  icon,
  onPress,
  variant = "default",
}: SecondaryButtonProps) {
  const { styles, theme } = useThemedStyles(makeStyles);

  const variantColors = {
    default: { border: theme.colors.border, label: theme.colors.text },
    destructive: { border: theme.colors.danger, label: theme.colors.danger },
    accent: { border: theme.colors.brand, label: theme.colors.brand },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { borderColor: variantColors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text
          style={[styles.label, { color: variantColors.label }]}
          maxFontSizeMultiplier={1.6}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    button: {
      minHeight: tapTarget.secondaryButtonHeight,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: radius["2xl"],
      borderWidth: 2,
      backgroundColor: t.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      opacity: 0.7,
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
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
    },
  });