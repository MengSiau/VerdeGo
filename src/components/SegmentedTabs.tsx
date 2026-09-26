import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type SegmentedTabsProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  /** Translucent-on-color variant for a colored hero header (e.g. Upcoming/Past on My Rides). */
  onHeader?: boolean;
};

// Equal-width tab picker - e.g. Upcoming/Past tabs, passenger/driver/both role picker.
export function SegmentedTabs<T extends string>({ options, value, onChange, onHeader }: SegmentedTabsProps<T>) {
  return (
    <View style={[styles.track, onHeader ? styles.trackOnHeader : styles.trackDefault]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              active && (onHeader ? styles.segmentActiveOnHeader : styles.segmentActiveDefault),
            ]}>
            <Text
              style={[
                styles.label,
                active
                  ? onHeader
                    ? styles.labelActiveOnHeader
                    : styles.labelActiveDefault
                  : onHeader
                    ? styles.labelInactiveOnHeader
                    : styles.labelInactiveDefault,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  trackDefault: {
    backgroundColor: colors.neutral.gray100,
  },
  trackOnHeader: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  segmentActiveDefault: {
    backgroundColor: colors.brand.verde500,
  },
  segmentActiveOnHeader: {
    backgroundColor: colors.neutral.white,
  },
  label: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
  },
  labelActiveDefault: {
    color: colors.neutral.white,
  },
  labelInactiveDefault: {
    color: colors.neutral.gray600,
  },
  labelActiveOnHeader: {
    color: colors.brand.verde700,
  },
  labelInactiveOnHeader: {
    color: 'rgba(255,255,255,0.7)',
  },
});
