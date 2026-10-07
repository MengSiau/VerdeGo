import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RideOverview } from '@/src/components/RideOverview';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { useRideDetails } from '@/src/hooks/useRideDetails';
import { colors, fontFamily, fontSize } from '@/src/theme';

import { CancelRideModal } from './CancelRideModal';

// Kept as its own screen (rather than a mode on RideDetails) since a ride you've already
// joined is expected to diverge further from a ride you're just browsing.
export function MyRideDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ride, loading, error, refresh } = useRideDetails(id);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

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

  return (
    <>
      <RideOverview
        ride={ride}
        actions={
          <SecondaryButton
            variant="destructive"
            label="Cancel Ride"
            onPress={() => setCancelModalVisible(true)}
          />
        }
      />
      <CancelRideModal
        visible={cancelModalVisible}
        ride={ride}
        onKeep={() => setCancelModalVisible(false)}
        onConfirmCancel={() => {
          // TODO: submit the actual cancellation to backend once it exists.
          setCancelModalVisible(false);
          router.push('/my-rides');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});
