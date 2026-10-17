import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Ride } from "@/src/data/rides";
import { useRoute } from "@/src/hooks/UseRoute";
import { fontFamily, radius, screenPaddingX } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";
import { calculateCo2SavedKg } from "@/src/utils/co2savings";

import { Avatar } from "./Avatar";
import { CalloutBanner } from "./CalloutBanner";
import { RideRouteMap } from "./RideRouteMap";
import { StatTile } from "./StatTile";
import { Stars } from "./Stars";

type RideOverviewProps = {
  ride: Ride;
  /** Bottom action area - differs per caller (e.g. "Request to Join" vs "Cancel Ride"). */
  actions: ReactNode;
};

// Read-only ride info shared by RideDetails (browsing) and MyRideDetails (a ride you've joined).
export function RideOverview({ ride, actions }: RideOverviewProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const seatsLeft = ride.seats - ride.confirmedPassengers.length;
  const co2SavedKg = calculateCo2SavedKg(ride.distanceKm, ride.confirmedPassengers.length);
  const co2PotentialKg = calculateCo2SavedKg(ride.distanceKm, ride.seats);
  const origin = { latitude: ride.pickupLat, longitude: ride.pickupLng };
  const destination = { latitude: ride.destinationLat, longitude: ride.destinationLng };
  const { route } = useRoute(origin, destination);

  return (
    <View style={styles.fill}>
      {/* The top of this screen is a map with light tiles, so the status bar stays dark
          until the map gets a night style. */}
      <StatusBar style="dark" />

      <View style={[styles.mapPlaceholder, { paddingTop: insets.top + 12 }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() =>
            router.push({
              pathname: "/route-map/[id]",
              params: { id: String(ride.id) },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`View route from ${ride.pickup} to ${ride.destination} on a map`}
        >
          <RideRouteMap ride={ride} style={StyleSheet.absoluteFill} />
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.driverRow}>
          <Avatar name={ride.driverName} size={56} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{ride.driverName}</Text>
            <Stars rating={ride.rating} />
            <Text style={styles.ratingCaption}>
              {ride.rating.toFixed(1)} · {ride.ratingCount} rides
            </Text>
          </View>
          <View style={styles.driverSide}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={theme.colors.brand} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
            <Text style={styles.price}>${ride.price.toFixed(2)}</Text>
            <Text style={styles.priceCaption}>per person</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            icon={<Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />}
            value={`${ride.distanceKm} km`}
          />
          <StatTile
            icon={<Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />}
            value={`${ride.durationMinutes} min`}
          />
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routeRow}>
            <View style={styles.pickupDot} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routePlace}>{ride.pickup}</Text>
              <Text style={styles.routeMeta}>Pick up · {ride.departureTime}</Text>
            </View>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeRow}>
            <Ionicons name="location" size={16} color={theme.colors.brand} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routePlace}>{ride.destination}</Text>
              <Text style={styles.routeMeta}>Drop off · est. {ride.dropoffTimeEstimate}</Text>
            </View>
          </View>
        </View>

        {ride.confirmedPassengers.length > 0 && (
          <View style={styles.passengersSection}>
            <View style={styles.passengersHeader}>
              <Text style={styles.sectionLabel}>Confirmed Passengers</Text>
              <View style={styles.seatsLeftPill}>
                <Text style={styles.seatsLeftText}>
                  {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left
                </Text>
              </View>
            </View>
            {ride.confirmedPassengers.map((passenger) => (
              <View key={passenger.name} style={styles.passengerRow}>
                <Avatar name={passenger.name} size={36} />
                <View style={styles.routeTextWrap}>
                  <Text style={styles.passengerName}>{passenger.name}</Text>
                  <Text style={styles.passengerPickup}>{passenger.pickup}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.co2Section}>
          <CalloutBanner
            variant="info"
            heading={`CO2 Estimate · ${ride.co2EstimateKg.toFixed(2)} kg total`}
            body={
              co2SavedKg > 0
                ? `Saving ${co2SavedKg.toFixed(2)} kg vs everyone driving alone`
                : `Could save up to ${co2PotentialKg.toFixed(2)} kg if all ${ride.seats} seats fill`
            }
            icon={<Ionicons name="leaf" size={20} color={theme.colors.brand} />}
          />
        </View>

        <View style={styles.fieldGroup}>{actions}</View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    mapPlaceholder: {
      height: 220,
      backgroundColor: t.colors.surface,
      paddingHorizontal: screenPaddingX.standard,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      borderWidth: 1.5,
      borderColor: t.colors.border,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    content: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 20,
    },
    driverRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    driverInfo: {
      flex: 1,
      gap: 4,
    },
    driverName: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
    },
    ratingCaption: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    driverSide: {
      alignItems: "flex-end",
      gap: 4,
      flexShrink: 1,
    },
    verifiedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.brand,
    },
    verifiedText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize["2xs"],
      lineHeight: t.lineHeight(t.fontSize["2xs"]),
      color: t.colors.brand,
    },
    price: {
      marginTop: 2,
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.brand,
    },
    priceCaption: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize["2xs"],
      lineHeight: t.lineHeight(t.fontSize["2xs"]),
      color: t.colors.textSecondary,
    },
    statsRow: {
      marginTop: 20,
      flexDirection: "row",
      gap: 10,
    },
    routeSection: {
      marginTop: 24,
    },
    routeRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    routeTextWrap: {
      flex: 1,
    },
    pickupDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: t.colors.accent,
      marginTop: 6,
      marginHorizontal: 4,
    },
    routeConnector: {
      width: 1.5,
      height: 16,
      marginLeft: 7.25,
      backgroundColor: t.colors.border,
    },
    routePlace: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    routeMeta: {
      marginTop: 2,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    passengersSection: {
      marginTop: 24,
    },
    passengersHeader: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    sectionLabel: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize["2xs"],
      lineHeight: t.lineHeight(t.fontSize["2xs"]),
      color: t.colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    seatsLeftPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
    },
    seatsLeftText: {
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize["2xs"],
      lineHeight: t.lineHeight(t.fontSize["2xs"]),
      color: t.colors.textSecondary,
    },
    passengerRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    passengerName: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    passengerPickup: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    co2Section: {
      marginTop: 20,
    },
    fieldGroup: {
      marginTop: 20,
    },
  });