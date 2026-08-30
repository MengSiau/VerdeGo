import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type StatTileProps = {
  icon: ReactNode;
  value: string;
};

// Small equal-width tile showing a stat/metric - e.g. ride detail quick facts row.
export function StatTile({ icon, value }: StatTileProps) {
  return (
    <View style={styles.tile}>
      {icon}
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral.gray50,
  },
  value: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray800,
  },
});
