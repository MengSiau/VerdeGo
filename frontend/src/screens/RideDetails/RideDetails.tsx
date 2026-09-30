import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RideOverview } from '@/src/components/RideOverview';
import { useRidesStore } from '@/src/data/RidesStore';
import { colors, fontFamily, fontSize } from '@/src/theme';

export function RideDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rides } = useRidesStore();
  const ride = rides.find((r) => r.id === id);

  if (!ride) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ride not found.</Text>
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
