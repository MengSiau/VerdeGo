import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/src/theme';

// TODO: swap for the real VerdeGo logo asset once provided.
export function LogoPlaceholder({ size = 96 }: { size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Ionicons name="leaf" size={size * 0.5} color={colors.neutral.white} />
      <View style={styles.badge}>
        <Ionicons name="arrow-forward" size={size * 0.16} color={colors.brand.verde600} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius['3xl'],
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
