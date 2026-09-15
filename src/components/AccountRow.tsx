//component to allow arrow on profile sub-sections to link to pages
//TO DO: need to create sub-pages to change details or determine if pop-up
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontFamily, fontSize, tapTarget } from "@/src/theme";

type AccountRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  onPress?: () => void;
};

// Icon + label + chevron row, e.g. Profile's Account section (Personal Info, Vehicle Details...).
export function AccountRow({
  icon,
  iconColor = colors.brand.verde600,
  label,
  onPress,
}: AccountRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.neutral.gray300}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: tapTarget.minimum,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 24,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: colors.neutral.gray800,
  },
});
