import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/src/components/Avatar';
import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type ProfilePhotoPickerProps = {
  name: string;
  onPress?: () => void;
};

// TODO: wire up to expo-image-picker once photo upload is implemented.
// Currently not used atm. 
export function ProfilePhotoPicker({ name, onPress }: ProfilePhotoPickerProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.avatarWrap}>
        <Avatar name={name} size={112} paletteIndex={avatarPaletteIndexGreen} />
        <View style={styles.badge}>
          <Ionicons name="add" size={20} color={colors.neutral.white} />
        </View>
      </View>
      <Text style={styles.caption}>Tap to upload photo</Text>
    </Pressable>
  );
}

// Index of the green pair in theme avatarPalettes — the user's own profile avatar stays on-brand.
const avatarPaletteIndexGreen = 7;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: colors.brand.verde200,
    borderRadius: radius.full,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  caption: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
});
