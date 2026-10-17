// Icon + label + chevron row, e.g. Profile's Account section (Personal Info, Vehicle Details...).
// TO DO: create sub-pages to change details, or decide if they should be pop-ups.
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fontFamily, tapTarget } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type AccountRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string; // optional override; defaults to the theme's brand colour
  label: string;
  onPress?: () => void;
};

export function AccountRow({ icon, iconColor, label, onPress }: AccountRowProps) {
  const { styles, theme } = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={iconColor ?? theme.colors.brand} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: tapTarget.minimum,
      paddingVertical: 14,
    },
    pressed: {
      opacity: 0.6,
    },
    iconWrap: {
      width: 24,
      alignItems: "center",
    },
    label: {
      flex: 1,
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
  });