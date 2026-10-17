import { Pressable, StyleSheet, Text, View } from "react-native";

import { fontFamily, radius } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type SegmentedTabsProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  /** Translucent-on-colour variant for a coloured hero header (e.g. Upcoming/Past on My Rides). */
  onHeader?: boolean;
};

// Equal-width tab picker - e.g. Upcoming/Past tabs, passenger/driver/both role picker.
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  onHeader,
}: SegmentedTabsProps<T>) {
  const { styles } = useThemedStyles(makeStyles);

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, onHeader ? styles.trackOnHeader : styles.trackDefault]}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            style={[
              styles.segment,
              active && (onHeader ? styles.segmentActiveOnHeader : styles.segmentActiveDefault),
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.6}
              style={[
                styles.label,
                active
                  ? onHeader
                    ? styles.labelActiveOnHeader
                    : styles.labelActiveDefault
                  : onHeader
                    ? styles.labelInactiveOnHeader
                    : styles.labelInactiveDefault,
              ]}
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
    track: {
      flexDirection: "row",
      borderRadius: radius.full,
      padding: 4,
      gap: 4,
    },
    trackDefault: {
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.border,
    },
    trackOnHeader: {
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    segment: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: radius.full,
    },
    segmentActiveDefault: {
      backgroundColor: t.colors.brand,
    },
    segmentActiveOnHeader: {
      backgroundColor: t.colors.onHeader,
    },
    label: {
      textAlign: "center",
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
    },
    labelActiveDefault: {
      color: t.colors.onBrand,
    },
    labelInactiveDefault: {
      color: t.colors.textSecondary,
    },
    // active pill is solid onHeader (white); its text matches the dark header
    labelActiveOnHeader: {
      color: t.colors.headerGradient[0],
    },
    labelInactiveOnHeader: {
      color: t.colors.onHeader,
    },
  });