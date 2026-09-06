import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RideOverview } from '@/src/components/RideOverview';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { DUMMY_RIDES } from '@/src/data/rides';
import { colors, fontFamily, fontSize } from '@/src/theme';

import { CancelRideModal } from './CancelRideModal';

// Kept as its own screen (rather than a mode on RideDetails) since a ride you've already
// joined is expected to diverge further from a ride you're just browsing.
export function MyRideDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ride = DUMMY_RIDES.find((r) => r.id === id);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  if (!ride) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ride not found.</Text>
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
  },
  notFoundText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
});
