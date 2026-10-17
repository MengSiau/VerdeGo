import { Pressable, StyleSheet, Text, View } from "react-native";

import { fontFamily, radius } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type SegmentedOptionsProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

// Equal-width rounded-xl option chips, individually bordered (not a single continuous track) -
// e.g. fuel type picker, role/tab pickers with more than 2-3 options.
export function SegmentedOptions<T extends string>({
  options,
  value,
  onChange,
}: SegmentedOptionsProps<T>) {
  const { styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active, checked: active }}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            <Text
              style={[styles.label, active ? styles.labelActive : styles.labelInactive]}
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
      gap: 10,
    },
    chip: {
      flex: 1,
      minHeight: 44,
      paddingVertical: 8,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.xl,
      // Same border width on both states so the chips don't shift size when selected
      borderWidth: 1.5,
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
      textAlign: "center",
    },
    labelActive: {
      color: t.colors.onBrand,
    },
    labelInactive: {
      color: t.colors.textSecondary,
    },
  });