import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { cancelRide, leaveRide } from '@/src/api/rides';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RideOverview } from '@/src/components/RideOverview';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useRideDetails } from '@/src/hooks/useRideDetails';
import { colors, fontFamily, fontSize } from '@/src/theme';

import { CancelRideModal } from './CancelRideModal';

// Kept as its own screen (rather than a mode on RideDetails) since a ride you've already
// joined is expected to diverge further from a ride you're just browsing.
export function MyRideDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ride, loading, error, refresh } = useRideDetails(id);
  const { user: currentUser } = useCurrentUser();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  // The driver cancels the whole ride; a passenger only cancels their own booking on
  // it - same button and confirmation, different backend call.
  const isDriver = currentUser?.user_id === ride.driverId;

  const handleConfirmCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      if (isDriver) {
        await cancelRide(id);
      } else {
        await leaveRide(id);
      }
      setCancelModalVisible(false);
      router.push('/my-rides');
    } catch (e) {
      Alert.alert('Unable to cancel ride', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setCancelling(false);
    }
  };

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
        confirming={cancelling}
        onKeep={() => setCancelModalVisible(false)}
        onConfirmCancel={handleConfirmCancel}
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
