import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, mapBg, radius } from '@/src/theme';

import { Avatar } from './Avatar';

type MyRideCardProps = {
  ride: Ride;
  dateLabel: string;
  onPress?: () => void;
};

// TODO: swap the route preview strip for a real map once map integration exists.
export function MyRideCard({ ride, dateLabel, onPress }: MyRideCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.routePreview}>
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
              Driver · {ride.rating.toFixed(1)} <Text style={styles.star}>★</Text>
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

        <View style={styles.footerRow}>
          <View style={styles.co2Row}>
            <View style={styles.co2Icon}>
              <Ionicons name="leaf" size={11} color={colors.neutral.white} />
            </View>
            <Text style={styles.co2Text}>{ride.co2EstimateKg.toFixed(2)} kg CO2</Text>
          </View>
          <Text style={styles.expandText}>Tap to expand ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    overflow: 'hidden',
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  routePreview: {
    height: 110,
    backgroundColor: mapBg,
    padding: 12,
    alignItems: 'flex-end',
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde600,
  },
  dateBadgeText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.neutral.white,
  },
  body: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverInfo: {
    flex: 1,
    gap: 2,
  },
  driverName: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  driverMeta: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  star: {
    color: colors.accent.amber500,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.brand.verde600,
  },
  departureTime: {
    marginTop: 2,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  routeRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
  },
  routeText: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  co2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  co2Icon: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  co2Text: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.brand.verde600,
  },
  expandText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.brand.verde600,
  },
});
