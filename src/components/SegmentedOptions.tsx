import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type SegmentedOptionsProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

// Equal-width rounded-xl option chips, individually bordered (not a single continuous track) -
// e.g. fuel type picker, role/tab pickers with more than 2-3 options.
export function SegmentedOptions<T extends string>({ options, value, onChange }: SegmentedOptionsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
            <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
  },
  chipActive: {
    backgroundColor: colors.brand.verde500,
  },
  chipInactive: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.gray200,
  },
  label: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
  },
  labelActive: {
    color: colors.neutral.white,
  },
  labelInactive: {
    color: colors.neutral.gray600,
  },
});
