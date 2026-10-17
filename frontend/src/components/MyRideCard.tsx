import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Ride } from "@/src/data/rides";
import { fontFamily, radius } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";
import { formatJoinedPassengers } from "@/src/utils/formatPassengers";

import { Avatar } from "./Avatar";

type MyRideCardProps = {
  ride: Ride;
  dateLabel: string;
  role: "driver" | "passenger";
  onPress?: () => void;
  /** Past rides pass this to show a review action in place of "Tap to expand". */
  onReview?: () => void;
  reviewed?: boolean;
};

// TODO: swap the route preview strip for a real map once map integration exists.
export function MyRideCard({ ride, dateLabel, role, onPress, onReview, reviewed }: MyRideCardProps) {
  const { styles, theme } = useThemedStyles(makeStyles);
  // ride.seats is already "seats still open" - the backend decrements it as bookings get
  // accepted, so it's not the vehicle's total capacity.
  const seatsLeft = ride.seats;
  const driverMeta =
    role === "driver"
      ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`
      : `Driver, rated ${ride.rating.toFixed(1)}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${role === "driver" ? "Driving" : "Riding"} on ${dateLabel}. ${ride.driverName}, ${driverMeta}. $${ride.price.toFixed(2)}, departs ${ride.departureTime}, from ${ride.pickup} to ${ride.destination}. Tap to expand.`}
      style={styles.card}
    >
      <View style={styles.routePreview}>
        <View
          style={[styles.roleBadge, role === "driver" ? styles.roleBadgeDriver : styles.roleBadgePassenger]}
        >
          <Ionicons
            name={role === "driver" ? "car-sport" : "person"}
            size={12}
            color={role === "driver" ? theme.colors.onBrand : theme.colors.text}
          />
          <Text
            style={[styles.roleBadgeText, role === "passenger" && styles.roleBadgeTextPassenger]}
          >
            {role === "driver" ? "Driving" : "Riding"}
          </Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{dateLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Avatar name={ride.driverName} size={40} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{ride.driverName}</Text>
            <Text style={styles.driverMeta}>
              {role === "driver" ? (
                `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`
              ) : (
                <>
                  Driver · {ride.rating.toFixed(1)} <Text style={styles.star}>★</Text>
                </>
              )}
            </Text>
          </View>
          <View style={styles.priceColumn}>
            <Text style={styles.price}>${ride.price.toFixed(2)}</Text>
            <Text style={styles.departureTime}>{ride.departureTime}</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.routeText}>
            {ride.pickup} → {ride.destination}
          </Text>
        </View>

        {ride.confirmedPassengers.length > 0 && (
          <View style={styles.passengersRow}>
            <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.passengersText}>
              {formatJoinedPassengers(ride.confirmedPassengers.map((p) => p.name))} onboard
            </Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.co2Row}>
            <View style={styles.co2Icon}>
              <Ionicons name="leaf" size={11} color={theme.colors.onBrand} />
            </View>
            <Text style={styles.co2Text}>{ride.co2EstimateKg.toFixed(2)} kg CO2</Text>
          </View>
          {onReview ? (
            reviewed ? (
              <View style={styles.reviewedPill}>
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.brand} />
                <Text style={styles.reviewedText}>Reviewed</Text>
              </View>
            ) : (
              <Pressable onPress={onReview} style={styles.reviewButton} accessibilityRole="button">
                <Text style={styles.reviewButtonText}>Leave a review</Text>
              </Pressable>
            )
          ) : (
            <Text style={styles.expandText}>Tap to expand ›</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: radius["2xl"],
      borderWidth: 1,
      borderColor: t.colors.divider,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    // Placeholder strip until the real map lands. Uses the page background so it
    // works in every theme (the old mapBg was a fixed light colour).
    routePreview: {
      minHeight: 110,
      backgroundColor: t.colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
      padding: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.full,
      borderWidth: 1.5,
    },
    roleBadgeDriver: {
      backgroundColor: t.colors.brand,
      borderColor: t.colors.brand,
    },
    roleBadgePassenger: {
      backgroundColor: t.colors.surface,
      borderColor: t.colors.border,
    },
    roleBadgeText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onBrand,
    },
    roleBadgeTextPassenger: {
      color: t.colors.text,
    },
    dateBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: t.colors.brand,
    },
    dateBadgeText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onBrand,
    },
    body: {
      padding: 16,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    driverInfo: {
      flex: 1,
      gap: 2,
    },
    driverName: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    driverMeta: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    star: {
      color: t.colors.accent,
    },
    priceColumn: {
      alignItems: "flex-end",
    },
    price: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.brand,
    },
    departureTime: {
      marginTop: 2,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    routeRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    pickupDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: t.colors.accent,
    },
    routeText: {
      flex: 1,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    passengersRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    passengersText: {
      flex: 1,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    footerRow: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      columnGap: 12,
      rowGap: 6,
    },
    co2Row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    co2Icon: {
      width: 18,
      height: 18,
      borderRadius: radius.full,
      backgroundColor: t.colors.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    co2Text: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.brand,
    },
    expandText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.brand,
    },
    reviewButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: t.colors.brand,
    },
    reviewButtonText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onBrand,
    },
    reviewedPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    reviewedText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.brand,
    },
  });
