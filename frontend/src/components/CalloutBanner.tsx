import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, radius } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

type CalloutVariant = 'info' | 'warning' | 'danger';

type CalloutBannerProps = {
  variant: CalloutVariant;
  /** Pass an icon coloured to match the variant (brand / accent / danger from useTheme). */
  icon: ReactNode;
  heading: string;
  body: string;
};

export function CalloutBanner({ variant, icon, heading, body }: CalloutBannerProps) {
  const { styles, theme } = useThemedStyles(makeStyles);

  const accent = {
    info: theme.colors.brand,
    warning: theme.colors.accent,
    danger: theme.colors.danger,
  }[variant];

  return (
    <View style={[styles.container, { borderColor: accent }]}>
      {icon}
      <View style={styles.textColumn}>
        <Text style={[styles.heading, { color: accent }]}>{heading}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      borderRadius: radius['2xl'],
      padding: 16,
      // surface + coloured outline replaces the pale tinted backgrounds
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
    },
    textColumn: {
      flex: 1,
    },
    heading: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
    },
    body: {
      marginTop: 2,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
  });