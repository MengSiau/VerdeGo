import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteMap } from '@/src/components/RouteMap';
import { useRideDetails } from '@/src/hooks/useRideDetails';
import { useRoute } from '@/src/hooks/UseRoute';
import { fontFamily, radius, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

export function FullscreenRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ride, loading, error } = useRideDetails(id);

  const origin = ride ? { latitude: ride.pickupLat, longitude: ride.pickupLng } : null;
  const destination = ride
    ? { latitude: ride.destinationLat, longitude: ride.destinationLng }
    : null;

  const { route } = useRoute(origin, destination);

  if (loading && !ride) {
    return (
      <View style={[styles.fill, styles.centre]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </View>
    );
  }

  if (error || !ride) {
    return (
      <View style={[styles.fill, styles.centre]}>
        <StatusBar style="dark" />
        <Text style={styles.missingText}>{error ?? 'That ride is no longer available.'}</Text>
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
        <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
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
          <Ionicons name="location" size={16} color={theme.colors.brand} />
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    centre: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 24,
    },
    missingText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textAlign: 'center',
    },
    missingBack: {
      padding: 8,
    },
    missingBackText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.brand,
    },
    backButton: {
      position: 'absolute',
      left: screenPaddingX.standard,
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
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
      backgroundColor: t.colors.surface,
      shadowColor: '#000',
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
      backgroundColor: t.colors.accent,
      marginHorizontal: 4,
    },
    routeConnector: {
      width: 1.5,
      height: 12,
      marginLeft: 7.25,
      marginVertical: 2,
      backgroundColor: t.colors.divider,
    },
    routePlace: {
      flex: 1,
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    routeMeta: {
      marginTop: 12,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
  });
