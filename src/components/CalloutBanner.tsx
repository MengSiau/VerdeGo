import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type CalloutVariant = 'info' | 'warning' | 'danger';

type CalloutBannerProps = {
  variant: CalloutVariant;
  icon: ReactNode;
  heading: string;
  body: string;
};

const variantStyles: Record<CalloutVariant, { background: string; heading: string; body: string }> = {
  info: {
    background: colors.brand.verde50,
    heading: colors.brand.verde700,
    body: colors.brand.verde600,
  },
  warning: {
    background: '#fffbeb',
    heading: '#b45309',
    body: colors.accent.amber500,
  },
  danger: {
    background: '#fef2f2',
    heading: colors.semantic.danger,
    body: colors.semantic.dangerLight,
  },
};

export function CalloutBanner({ variant, icon, heading, body }: CalloutBannerProps) {
  const palette = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {icon}
      <View style={styles.textColumn}>
        <Text style={[styles.heading, { color: palette.heading }]}>{heading}</Text>
        <Text style={[styles.body, { color: palette.body }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: radius['2xl'],
    padding: 16,
  },
  textColumn: {
    flex: 1,
  },
  heading: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
  },
  body: {
    marginTop: 2,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
