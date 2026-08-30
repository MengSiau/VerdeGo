import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '@/src/components/BottomNav';
import { FilterChips } from '@/src/components/FilterChips';
import { RideCard } from '@/src/components/RideCard';
import { DUMMY_RIDES } from '@/src/data/rides';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

type SortFilter = 'eco' | 'cost' | 'time';

const SORT_LABEL: Record<SortFilter, string> = {
  eco: 'sustainability',
  cost: 'price',
  time: 'arrival time',
};

export function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sort, setSort] = useState<SortFilter>('eco');

  const totalCo2Saved = useMemo(
    () => DUMMY_RIDES.reduce((sum, ride) => sum + ride.co2SavedKg, 0),
    []
  );

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.headerHero} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Find a Ride</Text>
          <View style={styles.co2Badge}>
            <Ionicons name="leaf" size={14} color={colors.neutral.white} />
            <Text style={styles.co2BadgeText}>{totalCo2Saved.toFixed(1)}kg saved</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.neutral.gray400} />
          <Text style={styles.searchPlaceholder}>Search pickup location...</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.filterSection}>
          <FilterChips
            options={[
              { label: 'Eco', value: 'eco', icon: <Ionicons name="leaf" size={16} color={sort === 'eco' ? colors.neutral.white : colors.brand.verde600} /> },
              { label: 'Cost', value: 'cost', icon: <Ionicons name="cash-outline" size={16} color={sort === 'cost' ? colors.neutral.white : colors.neutral.gray600} /> },
              { label: 'Time', value: 'time', icon: <Ionicons name="time-outline" size={16} color={sort === 'time' ? colors.neutral.white : colors.neutral.gray600} /> },
            ]}
            value={sort}
            onChange={setSort}
          />
          <Text style={styles.resultsText}>
            {DUMMY_RIDES.length} rides available · sorted by {SORT_LABEL[sort]}
          </Text>
        </View>

        <ScrollView
          style={styles.fill}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {DUMMY_RIDES.map((ride) => (
            <RideCard key={ride.id} ride={ride} onPress={() => router.push(`/ride-details/${ride.id}`)} />
          ))}
        </ScrollView>
      </View>

      <BottomNav active="feed" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenPaddingX.standard,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  co2Badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  co2BadgeText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.neutral.white,
  },
  searchBar: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
  },
  searchPlaceholder: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
  },
  body: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  filterSection: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
  },
  resultsText: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  listContent: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
});
