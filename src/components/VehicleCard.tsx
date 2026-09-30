import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/src/data/TempVehicleContext';
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
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{vehicle.fuelType}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {vehicle.colour} · {vehicle.plate} · {vehicle.seats} seats
      </Text>

      <View style={styles.statsRow}>
        <View style={[styles.statTile, styles.statTileGreen]}>
          <Text style={styles.statLabelGreen}>Rides completed</Text>
          <Text style={styles.statValueGreen}>{vehicle.ridesCompleted}</Text>
        </View>
        <View style={[styles.statTile, styles.statTileAmber]}>
          <Text style={styles.statLabelAmber}>Total CO₂ emitted</Text>
          <Text style={styles.statValueAmber}>
            {vehicle.totalCo2Kg.toFixed(1)}
            <Text style={styles.statUnit}> kg</Text>
          </Text>
        </View>
      </View>

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
  badge: {
    backgroundColor: colors.brand.verde100,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.brand.verde700,
  },
  meta: {
    marginTop: 4,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  statsRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statTile: {
    flex: 1,
    borderRadius: radius.xl,
    padding: 12,
  },
  statTileGreen: {
    backgroundColor: colors.brand.verde50,
  },
  statTileAmber: {
    backgroundColor: '#fffbeb',
  },
  statLabelGreen: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.brand.verde700,
  },
  statLabelAmber: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.accent.amber500,
  },
  statValueGreen: {
    marginTop: 4,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize['2xl'],
    color: colors.brand.verde700,
  },
  statValueAmber: {
    marginTop: 4,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize['2xl'],
    color: '#b45309',
  },
  statUnit: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
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
