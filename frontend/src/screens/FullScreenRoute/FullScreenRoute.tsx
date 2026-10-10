import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteMap } from '@/src/components/RouteMap';
import { useRidesStore } from '@/src/data/RidesStore';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

import { useRoute } from '@/src/hooks/UseRoute';

export function FullscreenRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rides } = useRidesStore();

  const ride = rides.find((r) => r.id === id);
  const origin = ride ? { latitude: ride.pickupLat, longitude: ride.pickupLng } : null;
  const destination = ride
    ? { latitude: ride.destinationLat, longitude: ride.destinationLng }
    : null;

  const { route } = useRoute(origin, destination);

  if (!ride) {
    return (
      <View style={[styles.fill, styles.centre]}>
        <StatusBar style="dark" />
        <Text style={styles.missingText}>That ride is no longer available.</Text>
        <Pressable onPress={() => router.back()} style={styles.missingBack}>
          <Text style={styles.missingBackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <StatusBar style="dark" />

      <RouteMap
        origin={{ latitude: ride.pickupLat, longitude: ride.pickupLng }}
        destination={{ latitude: ride.destinationLat, longitude: ride.destinationLng }}
        path={route?.path}
        interactive
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={[styles.backButton, { top: insets.top + 12 }]}
        accessibilityLabel="Close map"
        accessibilityRole="button">
        <Ionicons name="chevron-back" size={22} color={colors.neutral.gray900} />
      </Pressable>

      <View style={[styles.routeCard, { bottom: insets.bottom + 16 }]}>
        <View style={styles.routeRow}>
          <View style={styles.pickupDot} />
          <Text style={styles.routePlace} numberOfLines={1}>
            {ride.pickup}
          </Text>
        </View>

        <View style={styles.routeConnector} />

        <View style={styles.routeRow}>
          <Ionicons name="location" size={16} color={colors.brand.verde600} />
          <Text style={styles.routePlace} numberOfLines={1}>
            {ride.destination}
          </Text>
        </View>

        <Text style={styles.routeMeta}>
          {ride.distanceKm} km · {ride.durationMinutes} min · approximate
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missingText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray600,
  },
  missingBack: {
    padding: 8,
  },
  missingBackText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  backButton: {
    position: 'absolute',
    left: screenPaddingX.standard,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  routeCard: {
    position: 'absolute',
    left: screenPaddingX.standard,
    right: screenPaddingX.standard,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
    marginHorizontal: 4,
  },
  routeConnector: {
    width: 1.5,
    height: 12,
    marginLeft: 7.25,
    marginVertical: 2,
    backgroundColor: colors.neutral.gray200,
  },
  routePlace: {
    flex: 1,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  routeMeta: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
});
