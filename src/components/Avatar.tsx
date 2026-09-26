import { StyleSheet, Text, View } from 'react-native';

import { avatarPalettes, fontFamily } from '@/src/theme';

type AvatarProps = {
  name: string;
  size?: number;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
  return initials.toUpperCase();
}

function hashToIndex(name: string, length: number) {
  const sum = name.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return sum % length;
}

// Circular initials avatar. Palette is consistently derived from the name.
export function Avatar({ name, size = 36 }: AvatarProps) {
  const palette = avatarPalettes[hashToIndex(name, avatarPalettes.length)];

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.bg },
      ]}>
      <Text style={[styles.initials, { fontSize: size * 0.4, color: palette.text }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.headingBold,
  },
});
