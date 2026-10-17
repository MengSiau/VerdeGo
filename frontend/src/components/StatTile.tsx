import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, radius } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

type StatTileProps = {
  icon: ReactNode;
  value: string;
};

// Small equal-width tile showing a stat/metric - e.g. ride detail quick facts row.
export function StatTile({ icon, value }: StatTileProps) {
  const { styles } = useThemedStyles(makeStyles);

  return (
    <View style={styles.tile} accessible accessibilityLabel={value}>
      {icon}
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    tile: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: radius.xl,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
    },
    value: {
      flexShrink: 1,
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
  });