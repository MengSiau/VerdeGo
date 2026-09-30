import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fontFamily, fontSize, gradients } from "@/src/theme";

export type BottomNavTab = "feed" | "myRides" | "requests" | "profile";

type NavIconName = "home" | "car" | "notifications" | "person";

// TODO: wire Requests / Profile once those screens exist.
export function BottomNav({ active }: { active: BottomNavTab }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
      >
        <LinearGradient
          colors={gradients.postFabButton}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={22} color={colors.neutral.white} />
        </LinearGradient>
      </Pressable>
      <NavItem
        icon="notifications"
        label="Requests"
        isActive={active === "requests"}
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
  const color = isActive ? colors.brand.verde600 : colors.neutral.gray400;

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Ionicons
        name={isActive ? icon : (`${icon}-outline` as const)}
        size={22}
        color={color}
      />
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    paddingTop: 8,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
  },
  item: {
    alignItems: "center",
    gap: 2,
    minWidth: 44,
  },
  itemLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize["2xs"],
  },
  fab: {
    marginTop: -20,
  },
  fabGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
