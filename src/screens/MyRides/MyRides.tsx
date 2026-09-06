import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/BottomNav';
import { MyRideCard } from '@/src/components/MyRideCard';
import { SegmentedTabs } from '@/src/components/SegmentedTabs';
import { DUMMY_RIDES, MY_UPCOMING_RIDES, type Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

type RidesTab = 'upcoming' | 'past';

export function MyRides() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<RidesTab>('upcoming');

  const upcomingRides: { booking: (typeof MY_UPCOMING_RIDES)[number]; ride: Ride }[] = [];
  for (const booking of MY_UPCOMING_RIDES) {
    const ride = DUMMY_RIDES.find((r) => r.id === booking.rideId);
    if (ride) upcomingRides.push({ booking, ride });
  }

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
            {upcomingRides.map(({ booking, ride }) => (
              <MyRideCard
                key={ride.id}
                ride={ride}
                dateLabel={booking.dateLabel}
                onPress={() => router.push(`/ride-details/${ride.id}`)}
              />
            ))}
            <View style={styles.endOfList}>
              <Ionicons name="car-outline" size={16} color={colors.neutral.gray400} />
              <Text style={styles.endOfListText}>No more upcoming rides</Text>
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
