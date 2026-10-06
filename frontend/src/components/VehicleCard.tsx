import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/src/data/VehiclesStore';
import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type VehicleCardProps = {
  vehicle: Vehicle;
  onEdit: () => void;
  onRemove: () => void;
};

export function VehicleCard({ vehicle, onEdit, onRemove }: VehicleCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.vehicle_models
            ? `${vehicle.vehicle_models.year} ${vehicle.vehicle_models.make} ${vehicle.vehicle_models.model}`
            : 'Vehicle'}
        </Text>
      </View>
      <Text style={styles.meta}>{vehicle.license_plate}</Text>
      {vehicle.vehicle_models?.co2_g_per_km != null && (
        <Text style={styles.meta}>
          CO2e emissions: {vehicle.vehicle_models.co2_g_per_km} g/km
        </Text>
      )}

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton} onPress={onEdit}>
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
        <View style={styles.actionDivider} />
        <Pressable style={styles.actionButton} onPress={onRemove}>
          <Text style={styles.removeLabel}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    padding: 16,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.neutral.gray900,
  },
  meta: {
    marginTop: 4,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.neutral.gray200,
  },
  editLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  removeLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.semantic.danger,
  },
});
