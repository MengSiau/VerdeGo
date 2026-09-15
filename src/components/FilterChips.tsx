import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type FilterChipOption<T extends string> = {
  label: string;
  value: T;
  icon: ReactNode;
};

type FilterChipsProps<T extends string> = {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

// Pill filter chips (rounded-full, content-width) - e.g. the Eco/Cost/Time sort filter on Home.
export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
            {option.icon}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: radius.full,
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
