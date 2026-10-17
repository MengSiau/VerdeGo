import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/AuthProvider";
import { BottomNav } from "@/src/components/BottomNav";
import { FilterChips } from "@/src/components/FilterChips";
import { RideCard } from "@/src/components/RideCard";
import { CURRENT_USER_ID } from "@/src/data/currentUser";
import { useRidesStore } from "@/src/data/RidesStore";
import { fontFamily, radius, screenPaddingX } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";
import { calculateCo2SavedKg } from "@/src/utils/co2savings";

type SortFilter = "eco" | "cost" | "time";

const SORT_LABEL: Record<SortFilter, string> = {
  eco: "sustainability",
  cost: "price",
  time: "arrival time",
};

export function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { rides } = useRidesStore();
  const [sort, setSort] = useState<SortFilter>("eco");
  const { signOut } = useAuth();

  // Don't show the viewer their own posted rides in the browse feed - you wouldn't
  // request to join a ride you're the one offering.
  const browsableRides = useMemo(
    () => rides.filter((ride) => ride.driverId !== CURRENT_USER_ID),
    [rides],
  );

  const totalCo2Saved = useMemo(
    () =>
      browsableRides.reduce(
        (sum, ride) =>
          sum + calculateCo2SavedKg(ride.distanceKm, ride.confirmedPassengers.length),
        0,
      ),
    [browsableRides],
  );

  return (
    <View style={styles.fill}>
      {/* Header is dark green/black in every palette, so the status bar is always light */}
      <StatusBar style="light" />
      <LinearGradient
        colors={[...theme.colors.headerGradient]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Find a Ride</Text>
          <View style={styles.co2Badge}>
            <Ionicons name="leaf" size={14} color={theme.colors.onHeader} />
            <Text style={styles.co2BadgeText}>{totalCo2Saved.toFixed(1)}kg saved</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.muted} />
          <Text style={styles.searchPlaceholder}>Search pickup location...</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.filterSection}>
          <FilterChips
            options={[
              {
                label: "Eco",
                value: "eco",
                icon: (color) => <Ionicons name="leaf" size={16} color={color} />,
              },
              {
                label: "Cost",
                value: "cost",
                icon: (color) => <Ionicons name="cash-outline" size={16} color={color} />,
              },
              {
                label: "Time",
                value: "time",
                icon: (color) => <Ionicons name="time-outline" size={16} color={color} />,
              },
            ]}
            value={sort}
            onChange={setSort}
          />
          <Text style={styles.resultsText}>
            {browsableRides.length} rides available · sorted by {SORT_LABEL[sort]}
          </Text>
        </View>
        <Button title="Temp Sign Out" onPress={signOut} color={theme.colors.brand} />

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {browsableRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onPress={() => router.push(`/ride-details/${ride.id}`)}
            />
          ))}
        </ScrollView>
      </View>

      <BottomNav active="feed" />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    header: {
      paddingHorizontal: screenPaddingX.standard,
      paddingBottom: 20,
    },
    headerTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    headerTitle: {
      flexShrink: 1,
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.onHeader,
    },
    co2Badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    co2BadgeText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onHeader,
    },
    searchBar: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 50,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      // In high contrast the bar needs an edge, or it merges with a black header / white page
      borderWidth: 1.5,
      borderColor: t.colors.divider,
    },
    searchPlaceholder: {
      flex: 1,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.muted,
    },
    body: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    filterSection: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 16,
    },
    resultsText: {
      marginTop: 12,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 12,
    },
  });