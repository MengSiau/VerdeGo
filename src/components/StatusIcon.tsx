import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/src/theme';

type StatusIconVariant = 'danger' | 'success';

type StatusIconProps = {
  variant: StatusIconVariant;
  size?: number;
};

const variantStyles: Record<StatusIconVariant, { background: string; foreground: string }> = {
  danger: {
    background: '#fee2e2',
    foreground: colors.semantic.danger,
  },
  success: {
    background: colors.brand.verde100,
    foreground: colors.brand.verde600,
  },
};

// Large centered status circle used on outcome screens (e.g. email verification result).
export function StatusIcon({ variant, size = 96 }: StatusIconProps) {
  const palette = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.background },
      ]}>
      {variant === 'danger' ? (
        <Text style={[styles.exclamation, { color: palette.foreground, fontSize: size * 0.4 }]}>!</Text>
      ) : (
        <Ionicons name="checkmark" size={size * 0.45} color={palette.foreground} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  exclamation: {
    fontFamily: fontFamily.headingBold,
  },
});
