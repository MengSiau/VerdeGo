import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useRideDetails } from '@/src/hooks/useRideDetails';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

export function RideRequestSent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ride, loading, error, refresh } = useRideDetails(id);

  if (loading && !ride) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator size="large" color={colors.brand.verde600} />
      </View>
    );
  }

  if (error || !ride) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{error ?? 'Ride not found.'}</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="Try Again" onPress={() => void refresh()} />
        </View>
      </View>
    );
  }

  const shortPickup = ride.pickup.replace(/ Station$/, '');

  return (
    <View style={[styles.fill, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.iconHalo}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={36} color={colors.neutral.white} />
          </View>
        </View>

        <Text style={styles.title}>Request Sent!</Text>
        <Text style={styles.subtitle}>
          Your request has been sent to <Text style={styles.subtitleBold}>{ride.driverName}</Text>.
          You&apos;ll receive a notification once she accepts.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ride</Text>
            <Text style={styles.summaryValue}>{shortPickup} → Monash</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{ride.date}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{ride.departureTime}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fare</Text>
            <Text style={styles.summaryValue}>${ride.price.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Back to Feed" onPress={() => router.push('/home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  notFoundText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  retryButton: {
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    width: 140,
    height: 140,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 28,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize['2xl'],
    color: colors.neutral.gray900,
  },
  subtitle: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleBold: {
    fontFamily: fontFamily.bodySemibold,
    color: colors.neutral.gray700,
  },
  summaryCard: {
    marginTop: 28,
    width: '100%',
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.gray50,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  summaryValue: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  actions: {
    width: '100%',
  },
});
