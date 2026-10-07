import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/BottomNav';
import { FilterChips } from '@/src/components/FilterChips';
import { MyRideCard } from '@/src/components/MyRideCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SegmentedTabs } from '@/src/components/SegmentedTabs';
import { useRidesStore } from '@/src/data/RidesStore';
import { useMyRides } from '@/src/hooks/useMyRides';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

type RidesTab = 'upcoming' | 'past';
type RoleFilter = 'all' | 'driving' | 'riding';

export function MyRides() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reviews } = useRidesStore();
  const { upcoming, past, loading, error, refresh } = useMyRides();
  const [tab, setTab] = useState<RidesTab>('upcoming');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const upcomingRides = useMemo(() => {
    return upcoming.filter((entry) => {
      if (roleFilter === 'driving') return entry.role === 'driver';
      if (roleFilter === 'riding') return entry.role === 'passenger';
      return true;
    });
  }, [upcoming, roleFilter]);

  const pastRides = past;

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

      {loading && upcoming.length === 0 && past.length === 0 ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.brand.verde600} />
        </View>
      ) : error ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorTitle}>Unable to load your rides</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <View style={styles.errorButton}>
            <PrimaryButton label="Try Again" onPress={() => void refresh()} />
          </View>
        </View>
      ) : (
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
                {upcomingRides.map(({ ride, role }) => (
                  <MyRideCard
                    key={ride.id}
                    ride={ride}
                    dateLabel={ride.date}
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
          ) : pastRides.length > 0 ? (
            <View style={styles.cardsList}>
              {pastRides.map(({ ride, role }) => (
                <MyRideCard
                  key={ride.id}
                  ride={ride}
                  dateLabel={ride.date}
                  role={role}
                  onReview={() => router.push(`/post-review/${ride.id}`)}
                  reviewed={!!reviews[ride.id]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={20} color={colors.neutral.gray400} />
              <Text style={styles.endOfListText}>No past rides yet</Text>
            </View>
          )}
        </ScrollView>
      )}

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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenPaddingX.standard,
    gap: 8,
    backgroundColor: colors.neutral.white,
  },
  errorTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray800,
  },
  errorSubtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
});
