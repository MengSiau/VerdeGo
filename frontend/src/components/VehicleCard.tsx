import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Vehicle } from "@/src/data/VehiclesStore";
import { fontFamily, radius } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type VehicleCardProps = {
  vehicle: Vehicle;
  onEdit: () => void;
  onRemove: () => void;
};

export function VehicleCard({ vehicle, onEdit, onRemove }: VehicleCardProps) {
  const { styles } = useThemedStyles(makeStyles);
  const title = vehicle.vehicle_models
    ? `${vehicle.vehicle_models.year} ${vehicle.vehicle_models.make} ${vehicle.vehicle_models.model}`
    : "Vehicle";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {/* no numberOfLines: long names should wrap at Large text, not get cut off */}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.meta}>{vehicle.license_plate}</Text>
      {vehicle.vehicle_models?.co2_g_per_km != null && (
        <Text style={styles.meta}>
          CO2e emissions: {vehicle.vehicle_models.co2_g_per_km} g/km
        </Text>
      )}

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionButton}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${title}`}
        >
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <Pressable
          style={styles.actionButton}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title}`}
        >
          <Text style={styles.removeLabel}>Remove</Text>
        </Pressable>
      </View>
    </View>
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
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    title: {
      flex: 1,
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
    },
    meta: {
      marginTop: 4,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    actionsRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: t.colors.divider,
      paddingTop: 12,
    },
    actionButton: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    actionDivider: {
      width: 1,
      height: 20,
      backgroundColor: t.colors.divider,
    },
    editLabel: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.brand,
    },
    removeLabel: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.danger,
    },
  });