import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { requestToJoinRide } from '@/src/api/rides';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { RideOverview } from '@/src/components/RideOverview';
import { useRideDetails } from '@/src/hooks/useRideDetails';
import { fontFamily } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

export function RideDetails() {
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ride, loading, error, refresh } = useRideDetails(id);
  const [requesting, setRequesting] = useState(false);

  const handleRequestToJoin = async () => {
    if (!id) return;
    setRequesting(true);
    try {
      await requestToJoinRide(id);
      router.push(`/ride-request-sent/${id}`);
    } catch (e) {
      Alert.alert('Unable to send request', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading && !ride) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
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
        <PrimaryButton
          label={requesting ? 'Sending Request...' : 'Request to Join'}
          disabled={requesting}
          onPress={handleRequestToJoin}
        />
      }
    />
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    centeredState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 12,
      backgroundColor: t.colors.bg,
    },
    notFoundText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textAlign: 'center',
    },
    retryButton: {
      alignSelf: 'stretch',
    },
  });
