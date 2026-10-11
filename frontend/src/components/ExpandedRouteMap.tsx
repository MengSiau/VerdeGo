import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RouteMap } from '@/src/components/RouteMap';
import {
  colors,
  fontFamily,
  fontSize,
  mapBg,
  radius,
  screenPaddingX,
} from '@/src/theme';

/**
 * Declared locally rather than imported so this component doesn't depend on
 * where Coordinate currently lives. Structural typing means it still matches.
 */
type Coordinate = { latitude: number; longitude: number };

type ExpandableRouteMapProps = {
  origin: Coordinate | null;
  destination: Coordinate | null;
  /** Road path from useRoute(). Passed straight through to RouteMap. */
  path?: Coordinate[];
  originLabel: string;
  destinationLabel: string;
  distanceKm?: number;
  durationMinutes?: number;
  /** Preview height. The expanded view always fills the screen. */
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A route map that shows as a flat preview and expands to a full-screen,
 * pannable map when tapped.
 *
 * This expands in place with a Modal rather than navigating to
 * /route-map/[id], because that screen resolves a ride out of RidesStore by
 * id - which a ride being drafted doesn't have yet. A Modal also keeps the
 * draft mounted, so backing out returns to a filled-in review screen rather
 * than an empty wizard.
 */
export function ExpandableRouteMap({
  origin,
  destination,
  path,
  originLabel,
  destinationLabel,
  distanceKm,
  durationMinutes,
  height = 160,
  style,
}: ExpandableRouteMapProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const hasRoute = Boolean(origin && destination);

  const meta = [
    distanceKm !== undefined ? `${distanceKm} km` : null,
    durationMinutes !== undefined ? `${durationMinutes} min` : null,
    'approximate',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Pressable
        style={[styles.preview, { height }, style]}
        onPress={() => setExpanded(true)}
        // Nothing to expand without coordinates, so don't offer a dead tap.
        disabled={!hasRoute}
        accessibilityRole="button"
        accessibilityLabel="Expand route map"
        accessibilityHint="Opens a full screen map you can pan and zoom">
        {/* RouteMap sets pointerEvents to none when not interactive, so the tap
            reaches this Pressable rather than being eaten by the map. */}
        {origin && destination ? (
          <RouteMap
            origin={origin}
            destination={destination}
            path={path}
            style={StyleSheet.absoluteFill}
          />
        ) : null}

        <View style={[styles.pill, styles.pillStart]}>
          <Text style={styles.pillText} numberOfLines={1}>
            {originLabel}
          </Text>
        </View>
        <View style={[styles.pill, styles.pillEnd]}>
          <Text style={styles.pillText} numberOfLines={1}>
            {destinationLabel}
          </Text>
        </View>

        {hasRoute ? (
          <View style={styles.expandBadge}>
            <Ionicons name="expand" size={16} color={colors.neutral.gray900} />
          </View>
        ) : null}
      </Pressable>

      <Modal
        visible={expanded}
        animationType="fade"
        // Android's hardware back button closes the map instead of leaving the
        // screen underneath it.
        onRequestClose={() => setExpanded(false)}
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape']}>
        <View style={styles.fullscreen}>
          {origin && destination ? (
            <RouteMap
              origin={origin}
              destination={destination}
              path={path}
              interactive
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          <Pressable
            onPress={() => setExpanded(false)}
            hitSlop={8}
            style={[styles.closeButton, { top: insets.top + 12 }]}
            accessibilityRole="button"
            accessibilityLabel="Close map">
            <Ionicons name="close" size={22} color={colors.neutral.gray900} />
          </Pressable>

          <View style={[styles.routeCard, { bottom: insets.bottom + 16 }]}>
            <View style={styles.routeRow}>
              <View style={styles.pickupDot} />
              <Text style={styles.routePlace} numberOfLines={1}>
                {originLabel}
              </Text>
            </View>

            <View style={styles.routeConnector} />

            <View style={styles.routeRow}>
              <Ionicons name="location" size={16} color={colors.brand.verde600} />
              <Text style={styles.routePlace} numberOfLines={1}>
                {destinationLabel}
              </Text>
            </View>

            <Text style={styles.routeMeta}>{meta}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  preview: {
    // Shows for the moment before map tiles paint, and if coordinates are missing.
    backgroundColor: mapBg,
  },
  pill: {
    position: 'absolute',
    maxWidth: '55%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pillStart: {
    left: 12,
    top: 12,
  },
  pillEnd: {
    right: 12,
    bottom: 12,
  },
  pillText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.neutral.gray800,
  },
  expandBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  closeButton: {
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