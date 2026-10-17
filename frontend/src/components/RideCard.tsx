import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Ride } from "@/src/data/rides";
import { fontFamily, radius } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";
import { calculateCo2SavedKg } from "@/src/utils/co2savings";
import { formatJoinedPassengers } from "@/src/utils/formatPassengers";

import { Avatar } from "./Avatar";
import { Stars } from "./Stars";

type RideCardProps = {
  ride: Ride;
  onPress?: () => void;
};

export function RideCard({ ride, onPress }: RideCardProps) {
  const { styles, theme } = useThemedStyles(makeStyles);
  const co2Saved = calculateCo2SavedKg(ride.distanceKm, 1).toFixed(1);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ride with ${ride.driverName}, $${ride.price.toFixed(2)}, from ${ride.pickup} to ${ride.destination}, departs ${ride.departureTime}, ${ride.seats} seats, ${ride.durationMinutes} minutes`}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Avatar name={ride.driverName} size={44} />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{ride.driverName}</Text>
          <Stars rating={ride.rating} />
        </View>
        <Text style={styles.price}>${ride.price.toFixed(2)}</Text>
      </View>

      <View style={styles.routeSection}>
        <View style={styles.routeRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.routeText}>{ride.pickup}</Text>
        </View>
        <View style={styles.routeConnector} />
        <View style={styles.routeRow}>
          <Ionicons name="location" size={16} color={theme.colors.brand} />
          <Text style={styles.routeText}>{ride.destination}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{ride.departureTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{ride.seats} seats</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="hourglass-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{ride.durationMinutes} min</Text>
        </View>
      </View>

      <View style={styles.co2Row}>
        <View style={styles.co2Icon}>
          <Ionicons name="leaf" size={12} color={theme.colors.onBrand} />
        </View>
        <Text style={styles.co2Text}>{co2Saved}kg by joining</Text>
      </View>

      {ride.confirmedPassengers.length > 0 && (
        <View style={styles.passengersRow}>
          <Ionicons name="people-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.passengersText}>
            {formatJoinedPassengers(ride.confirmedPassengers.map((p) => p.name))} joined
          </Text>
        </View>
      )}
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
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    driverInfo: {
      flex: 1,
      gap: 4,
    },
    driverName: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    price: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.brand,
    },
    routeSection: {
      marginTop: 14,
    },
    routeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    pickupDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: t.colors.text,
      marginHorizontal: 4,
    },
    routeConnector: {
      width: 1.5,
      height: 12,
      marginLeft: 7.25,
      backgroundColor: t.colors.border,
    },
    routeText: {
      flex: 1,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    metaRow: {
      marginTop: 12,
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: 16,
      rowGap: 6,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    co2Row: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    co2Icon: {
      width: 20,
      height: 20,
      borderRadius: radius.full,
      backgroundColor: t.colors.brand,
      alignItems: "center",
      justifyContent: "center",
    },
    co2Text: {
      flex: 1,
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.brand,
    },
    passengersRow: {
      marginTop: 8,
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
  });
