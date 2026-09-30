import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, mapBg, radius, screenPaddingX } from '@/src/theme';

import { Avatar } from './Avatar';
import { CalloutBanner } from './CalloutBanner';
import { StatTile } from './StatTile';
import { Stars } from './Stars';

type RideOverviewProps = {
  ride: Ride;
  /** Bottom action area - differs per caller (e.g. "Request to Join" vs "Cancel Ride"). */
  actions: ReactNode;
};

// Read-only ride info shared by RideDetails (browsing) and MyRideDetails (a ride you've joined).
export function RideOverview({ ride, actions }: RideOverviewProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const seatsLeft = ride.seats - ride.confirmedPassengers.length;

  return (
    <View style={styles.fill}>
      <StatusBar style="dark" />

      {/* TODO: replace with a real map preview (e.g. react-native-maps) showing the route. */}
      <View style={[styles.mapPlaceholder, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={22} color={colors.neutral.gray900} />
        </Pressable>
        <View style={styles.mapPlaceholderContent}>
          <Ionicons name="map-outline" size={28} color={colors.brand.verde600} />
          <Text style={styles.mapPlaceholderText}>Map preview coming soon</Text>
        </View>
      </View>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}>
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
              <Ionicons name="checkmark-circle" size={14} color={colors.brand.verde600} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
            <Text style={styles.price}>${ride.price.toFixed(2)}</Text>
            <Text style={styles.priceCaption}>per person</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            icon={<Ionicons name="location-outline" size={16} color={colors.neutral.gray500} />}
            value={`${ride.distanceKm} km`}
          />
          <StatTile
            icon={<Ionicons name="time-outline" size={16} color={colors.neutral.gray500} />}
            value={`${ride.durationMinutes} min`}
          />
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routeRow}>
            <View style={styles.pickupDot} />
            <View>
              <Text style={styles.routePlace}>{ride.pickup}</Text>
              <Text style={styles.routeMeta}>Pick up · {ride.departureTime}</Text>
            </View>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeRow}>
            <Ionicons name="location" size={16} color={colors.brand.verde600} />
            <View>
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
                  {seatsLeft} seat{seatsLeft === 1 ? '' : 's'} left
                </Text>
              </View>
            </View>
            {ride.confirmedPassengers.map((passenger) => (
              <View key={passenger.name} style={styles.passengerRow}>
                <Avatar name={passenger.name} size={36} />
                <View>
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
            body={`You'd save ${ride.co2SavedKg.toFixed(2)} kg vs driving alone`}
            icon={<Ionicons name="leaf" size={20} color={colors.brand.verde600} />}
          />
        </View>

        <View style={styles.fieldGroup}>{actions}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  mapPlaceholder: {
    height: 220,
    backgroundColor: mapBg,
    paddingHorizontal: screenPaddingX.standard,
  },
  mapPlaceholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray600,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral.charcoal,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  driverInfo: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.neutral.gray900,
  },
  ratingCaption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  driverSide: {
    alignItems: 'flex-end',
    gap: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde50,
  },
  verifiedText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize['2xs'],
    color: colors.brand.verde700,
  },
  price: {
    marginTop: 2,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.brand.verde600,
  },
  priceCaption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray500,
  },
  statsRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  routeSection: {
    marginTop: 24,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
    marginTop: 6,
    marginHorizontal: 4,
  },
  routeConnector: {
    width: 1.5,
    height: 16,
    marginLeft: 7.25,
    backgroundColor: colors.neutral.gray200,
  },
  routePlace: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  routeMeta: {
    marginTop: 2,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  passengersSection: {
    marginTop: 24,
  },
  passengersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seatsLeftPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray100,
  },
  seatsLeftText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray600,
  },
  passengerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passengerName: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  passengerPickup: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  co2Section: {
    marginTop: 20,
  },
  fieldGroup: {
    marginTop: 20,
  },
});
