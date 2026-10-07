import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RideOverview } from '@/src/components/RideOverview';
import { useRideDetails } from '@/src/hooks/useRideDetails';
import { colors, fontFamily, fontSize } from '@/src/theme';

export function RideDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ride, loading, error, refresh } = useRideDetails(id);

  if (loading && !ride) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.brand.verde600} />
      </View>
    );
  }

  if (error || !ride) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.notFoundText}>{error ?? 'Ride not found.'}</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="Try Again" onPress={() => void refresh()} />
        </View>
      </View>
    );
  }

  return (
    <RideOverview
      ride={ride}
      actions={
        // TODO: submit the actual join request to backend once it exists.
        <PrimaryButton label="Request to Join" onPress={() => router.push(`/ride-request-sent/${ride.id}`)} />
      }
    />
  );
}

const styles = StyleSheet.create({
  centeredState: {
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
});
