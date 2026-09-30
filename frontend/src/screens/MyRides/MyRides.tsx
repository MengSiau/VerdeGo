import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/BottomNav';
import { FilterChips } from '@/src/components/FilterChips';
import { MyRideCard } from '@/src/components/MyRideCard';
import { SegmentedTabs } from '@/src/components/SegmentedTabs';
import { CURRENT_USER_ID } from '@/src/data/currentUser';
import { useRidesStore } from '@/src/data/RidesStore';
import type { MyRideBooking, Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

type RidesTab = 'upcoming' | 'past';
type RoleFilter = 'all' | 'driving' | 'riding';

export function MyRides() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rides, myBookings } = useRidesStore();
  const [tab, setTab] = useState<RidesTab>('upcoming');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const upcomingRides = useMemo(() => {
    const entries: { booking: MyRideBooking; ride: Ride; role: 'driver' | 'passenger' }[] = [];
    for (const booking of myBookings) {
      const ride = rides.find((r) => r.id === booking.rideId);
      if (ride) entries.push({ booking, ride, role: ride.driverId === CURRENT_USER_ID ? 'driver' : 'passenger' });
    }

    const filtered = entries.filter((entry) => {
      if (roleFilter === 'driving') return entry.role === 'driver';
      if (roleFilter === 'riding') return entry.role === 'passenger';
      return true;
    });

    // Rides you're driving surface first - it's your own posting, not just something you joined.
    return filtered.sort((a, b) => (a.role === b.role ? 0 : a.role === 'driver' ? -1 : 1));
  }, [rides, myBookings, roleFilter]);

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.headerHero} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>My Rides</Text>
        <View style={styles.tabsWrap}>
          <SegmentedTabs
            options={[
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'Past', value: 'past' },
            ]}
            value={tab}
            onChange={setTab}
            onHeader
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {tab === 'upcoming' ? (
          <>
            <FilterChips
              options={[
                { label: 'All', value: 'all', icon: <Ionicons name="apps-outline" size={14} color={roleFilter === 'all' ? colors.neutral.white : colors.neutral.gray600} /> },
                { label: 'Driving', value: 'driving', icon: <Ionicons name="car-sport-outline" size={14} color={roleFilter === 'driving' ? colors.neutral.white : colors.neutral.gray600} /> },
                { label: 'Riding', value: 'riding', icon: <Ionicons name="person-outline" size={14} color={roleFilter === 'riding' ? colors.neutral.white : colors.neutral.gray600} /> },
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
            />

            <View style={styles.cardsList}>
              {upcomingRides.map(({ booking, ride, role }) => (
                <MyRideCard
                  key={ride.id}
                  ride={ride}
                  dateLabel={booking.dateLabel}
                  role={role}
                  onPress={() => router.push(`/my-ride-details/${ride.id}`)}
                />
              ))}
              <View style={styles.endOfList}>
                <Ionicons name="car-outline" size={16} color={colors.neutral.gray400} />
                <Text style={styles.endOfListText}>
                  {upcomingRides.length === 0 ? 'No rides match this filter' : 'No more upcoming rides'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={20} color={colors.neutral.gray400} />
            <Text style={styles.endOfListText}>No past rides yet</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav active="myRides" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenPaddingX.standard,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  tabsWrap: {
    marginTop: 16,
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    paddingBottom: 20,
  },
  cardsList: {
    marginTop: 16,
    gap: 12,
  },
  endOfList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.gray100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  endOfListText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
  },
});
