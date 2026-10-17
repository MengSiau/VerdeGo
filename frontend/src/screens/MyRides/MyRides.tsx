import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/BottomNav';
import { FilterChips } from '@/src/components/FilterChips';
import { MyRideCard } from '@/src/components/MyRideCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SegmentedTabs } from '@/src/components/SegmentedTabs';
import { useMyRides } from '@/src/hooks/useMyRides';
import { fontFamily, radius, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

type RidesTab = 'upcoming' | 'past';
type RoleFilter = 'all' | 'driving' | 'riding';

export function MyRides() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
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
      {/* Header is dark in every palette, so the status bar is always light */}
      <StatusBar style="light" />
      <LinearGradient colors={[...theme.colors.headerGradient]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
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

      {tab === 'upcoming' && (
        <View style={styles.filterSection}>
          <FilterChips
            options={[
              { label: 'All', value: 'all', icon: (color) => <Ionicons name="apps-outline" size={14} color={color} /> },
              { label: 'Driving', value: 'driving', icon: (color) => <Ionicons name="car-sport-outline" size={14} color={color} /> },
              { label: 'Riding', value: 'riding', icon: (color) => <Ionicons name="person-outline" size={14} color={color} /> },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </View>
      )}

      {loading && upcoming.length === 0 && past.length === 0 ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={theme.colors.brand} />
          }>
          {tab === 'upcoming' ? (
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
                <Ionicons name="car-outline" size={16} color={theme.colors.muted} />
                <Text style={styles.endOfListText}>
                  {upcomingRides.length === 0 ? 'No rides match this filter' : 'No more upcoming rides'}
                </Text>
              </View>
            </View>
          ) : pastRides.length > 0 ? (
            <View style={styles.cardsList}>
              {pastRides.map(({ ride, role, status, reviewed }) => {
                // Only a passenger can review, and only once the ride actually
                // happened - not a cancelled one, and never the driver reviewing themselves.
                const canReview = role === 'passenger' && status === 'completed';
                return (
                  <MyRideCard
                    key={ride.id}
                    ride={ride}
                    dateLabel={ride.date}
                    role={role}
                    onReview={canReview ? () => router.push(`/post-review/${ride.id}`) : undefined}
                    reviewed={canReview ? reviewed : undefined}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={20} color={theme.colors.muted} />
              <Text style={styles.endOfListText}>No past rides yet</Text>
            </View>
          )}
        </ScrollView>
      )}

      <BottomNav active="myRides" />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    header: {
      paddingHorizontal: screenPaddingX.standard,
      paddingBottom: 16,
    },
    headerTitle: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.onHeader,
    },
    tabsWrap: {
      marginTop: 16,
    },
    filterSection: {
      backgroundColor: t.colors.bg,
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 16,
    },
    listContent: {
      flexGrow: 1,
      backgroundColor: t.colors.bg,
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 16,
      paddingBottom: 20,
    },
    cardsList: {
      gap: 12,
    },
    endOfList: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: radius['2xl'],
      // surface + outline instead of a grey fill, which turns into a solid
      // black/white block in high contrast and hides the text
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    endOfListText: {
      flexShrink: 1,
      textAlign: 'center',
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.muted,
    },
    centeredState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: screenPaddingX.standard,
      gap: 8,
      backgroundColor: t.colors.bg,
    },
    errorTitle: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    errorSubtitle: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textAlign: 'center',
    },
    errorButton: {
      marginTop: 12,
      alignSelf: 'stretch',
    },
  });
