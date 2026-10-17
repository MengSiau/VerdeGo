import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fontFamily, radius } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type FilterChipOption<T extends string> = {
  label: string;
  value: T;
  /** Receives the colour the icon should use for the chip's current state. */
  icon: (color: string) => ReactNode;
};

type FilterChipsProps<T extends string> = {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Pill filter chips (rounded-full, content-width)
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  const { styles, theme } = useThemedStyles(makeStyles);

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        const contentColor = active ? theme.colors.onBrand : theme.colors.textSecondary;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active, checked: active }}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            {option.icon(contentColor)}
            <Text
              style={[styles.label, { color: contentColor }]}
              maxFontSizeMultiplier={1.6}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      flexWrap: "wrap", // chips drop to a second line, no overflow 
      gap: 10,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 40,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: radius.full,
      borderWidth: 1.5, // same width in both states so chips don't change size when selected
    },
    chipActive: {
      backgroundColor: t.colors.brand,
      borderColor: t.colors.brand,
    },
    chipInactive: {
      backgroundColor: t.colors.surface,
      borderColor: t.colors.border,
    },
    label: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
    },
  });