import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, radius } from '@/src/theme';

import { Avatar } from './Avatar';
import { Stars } from './Stars';

type RideCardProps = {
  ride: Ride;
  onPress?: () => void;
};

export function RideCard({ ride, onPress }: RideCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
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
          <Ionicons name="location" size={16} color={colors.brand.verde600} />
          <Text style={styles.routeText}>{ride.destination}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.neutral.gray500} />
          <Text style={styles.metaText}>{ride.departureTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={colors.neutral.gray500} />
          <Text style={styles.metaText}>{ride.seats} seats</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.neutral.gray500} />
          <Text style={styles.metaText}>{ride.durationMinutes} min</Text>
        </View>
      </View>

      <View style={styles.co2Row}>
        <View style={styles.co2Icon}>
          <Ionicons name="leaf" size={12} color={colors.neutral.white} />
        </View>
        <Text style={styles.co2Text}>{ride.co2SavedKg.toFixed(1)}kg CO2 saved</Text>
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
    padding: 16,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverInfo: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  price: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.brand.verde600,
  },
  routeSection: {
    marginTop: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
    marginHorizontal: 4,
  },
  routeConnector: {
    width: 1.5,
    height: 12,
    marginLeft: 7.25,
    backgroundColor: colors.neutral.gray200,
  },
  routeText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  co2Row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  co2Icon: {
    width: 20,
    height: 20,
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
});
