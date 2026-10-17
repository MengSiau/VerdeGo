import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useRidesStore } from "@/src/data/RidesStore";
import { fontFamily, radius, screenPaddingX } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

export function RideRequestSent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rides } = useRidesStore();
  const ride = rides.find((r) => r.id === id);

  if (!ride) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ride not found.</Text>
      </View>
    );
  }

  const shortPickup = ride.pickup.replace(/ Station$/, "");

  return (
    <View style={[styles.fill, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      {/* ScrollView so the button can't be pushed off-screen at Large text */}
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconHalo}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={36} color={theme.colors.onBrand} />
          </View>
        </View>

        <Text style={styles.title}>Request Sent!</Text>
        <Text style={styles.subtitle}>
          Your request has been sent to <Text style={styles.subtitleBold}>{ride.driverName}</Text>.
          You&apos;ll receive a notification once they accept.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ride</Text>
            <Text style={styles.summaryValue}>{shortPickup} → Monash</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{ride.date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{ride.departureTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fare</Text>
            <Text style={styles.summaryValue}>${ride.price.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <PrimaryButton label="Back to Feed" onPress={() => router.push("/home")} />
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
      paddingHorizontal: screenPaddingX.standard,
    },
    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.colors.bg,
    },
    notFoundText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    iconHalo: {
      width: 140,
      height: 140,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      borderWidth: 2,
      borderColor: t.colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: t.colors.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 28,
      textAlign: "center",
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize["2xl"],
      lineHeight: t.lineHeight(t.fontSize["2xl"]),
      color: t.colors.text,
    },
    subtitle: {
      marginTop: 12,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textAlign: "center",
    },
    subtitleBold: {
      fontFamily: fontFamily.bodySemibold,
      color: t.colors.text,
    },
    summaryCard: {
      marginTop: 28,
      width: "100%",
      borderRadius: radius["2xl"],
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
      padding: 16,
    },
    summaryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      columnGap: 12,
      paddingVertical: 6,
    },
    summaryLabel: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    summaryValue: {
      flexShrink: 1,
      textAlign: "right",
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    actions: {
      width: "100%",
    },
  });