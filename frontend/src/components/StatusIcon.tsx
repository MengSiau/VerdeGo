import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

type StatusIconVariant = 'danger' | 'success' | 'neutral';

type StatusIconProps = {
  variant: StatusIconVariant;
  size?: number;
};

// Large centered status circle used on outcome screens (e.g. email verification result).
export function StatusIcon({ variant, size = 96 }: StatusIconProps) {
  const { styles, theme } = useThemedStyles(makeStyles);
  const foreground = variant === 'danger' ? theme.colors.danger : theme.colors.brand;

  return (
    <View
      accessible
      accessibilityLabel={variant === 'danger' ? 'Error' : 'Success'}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: foreground,
        },
      ]}>
      {variant === 'danger' ? (
        <Text
          maxFontSizeMultiplier={1}
          style={[styles.exclamation, { color: foreground, fontSize: size * 0.4 }]}>
          !
        </Text>
      ) : (
        <Ionicons name="checkmark" size={size * 0.45} color={foreground} />
      )}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      // surface fill + coloured ring instead of a pale tint, which vanishes in dark mode
      backgroundColor: t.colors.surface,
      borderWidth: 3,
    },
    exclamation: {
      fontFamily: fontFamily.headingBold,
    },
  });