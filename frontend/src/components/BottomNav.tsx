import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily, tapTarget } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

export type BottomNavTab = "feed" | "myRides" | "requests" | "profile";

type NavIconName = "home" | "car" | "notifications" | "person";

export function BottomNav({ active }: { active: BottomNavTab }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <NavItem
        icon="home"
        label="Feed"
        isActive={active === "feed"}
        onPress={() => router.replace("/home")}
      />
      <NavItem
        icon="car"
        label="My Rides"
        isActive={active === "myRides"}
        onPress={() => router.replace("/my-rides")}
      />
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/post-location")}
        accessibilityRole="button"
        accessibilityLabel="Post a ride"
      >
        <Ionicons name="add" size={22} color={theme.colors.onBrand} />
      </Pressable>
      <NavItem
        icon="notifications"
        label="Requests"
        isActive={active === "requests"}
        onPress={() => router.replace("/requests")}
      />
      <NavItem
        icon="person"
        label="Profile"
        isActive={active === "profile"}
        onPress={() => router.replace("/profile")}
      />
    </View>
  );
}

function NavItem({
  icon,
  label,
  isActive,
  onPress,
}: {
  icon: NavIconName;
  label: string;
  isActive: boolean;
  onPress?: () => void;
}) {
  const { styles, theme } = useThemedStyles(makeStyles);
  const color = isActive ? theme.colors.brand : theme.colors.muted;

  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      {/* Active = filled icon, inactive = outline, so state isn't shown by colour alone (WCAG 1.4.1) */}
      <Ionicons
        name={isActive ? icon : (`${icon}-outline` as const)}
        size={22}
        color={color}
      />
      <Text style={[styles.itemLabel, { color }]} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-around",
      paddingTop: 8,
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderTopColor: t.colors.divider,
    },
    item: {
      alignItems: "center",
      gap: 2,
      minWidth: tapTarget.minimum,
      minHeight: tapTarget.minimum,
    },
    itemLabel: {
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize["2xs"],
      lineHeight: t.lineHeight(t.fontSize["2xs"]),
    },
    fab: {
      marginTop: -20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.brand,
      // outline keeps the button visible in high-contrast dark, where brand is the only colour on black
      borderWidth: t.colors.border === "#ffffff" || t.colors.border === "#000000" ? 2 : 0,
      borderColor: t.colors.border,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
  });
