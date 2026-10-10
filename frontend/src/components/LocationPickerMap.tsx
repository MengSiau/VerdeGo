import { useCallback, useRef, useState, type RefObject } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import type { Coordinate } from '@/src/hooks/UseReverseGeocode';
import { colors, radius } from '@/src/theme';

type LocationPickerMapProps = {
  /** Optional external ref, so a parent can animate the map to a searched place. */
  mapRef?: RefObject<MapView | null>;
  /** Where the map opens. */
  initialCentre: Coordinate;
  /** Fires when the map settles after a pan, with the new centre coordinate. */
  onCentreChange: (coordinate: Coordinate) => void;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_DELTA = 0.015;

/**
 * Centre-pin location picker: the map moves under a fixed pin, and the pin's
 * position is whatever the map is centred on. Standard pattern for ride apps -
 * avoids dragging a marker on a small screen, and lets the user drop a pin
 * anywhere rather than choosing from a fixed list.
 *
 * The pin is an overlay rather than a Marker so it stays visually fixed to the
 * centre during gestures.
 */
export function LocationPickerMap({
  mapRef,
  initialCentre,
  onCentreChange,
  style,
}: LocationPickerMapProps) {
  const internalRef = useRef<MapView>(null);
  const ref = mapRef ?? internalRef;

  const [isMoving, setIsMoving] = useState(false);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setIsMoving(false);
      onCentreChange({ latitude: region.latitude, longitude: region.longitude });
    },
    [onCentreChange],
  );

  return (
    <View style={style}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          ...initialCentre,
          latitudeDelta: DEFAULT_DELTA,
          longitudeDelta: DEFAULT_DELTA,
        }}
        onRegionChange={() => setIsMoving(true)}
        onRegionChangeComplete={handleRegionChangeComplete}
        rotateEnabled={false}
        pitchEnabled={false}
        showsCompass={false}
        showsMyLocationButton={false}
      />

      <View style={[StyleSheet.absoluteFill, styles.pinContainer]} pointerEvents="none">
        <View style={[styles.pinOuter, isMoving && styles.pinOuterLifted]}>
          <View style={styles.pinInner} />
        </View>
        <View style={styles.pinStem} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOuter: {
    width: 40,
    height: 40,
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
  // Small lift while panning, so the pin reads as hovering over the map.
  pinOuterLifted: {
    transform: [{ translateY: -6 }],
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  pinInner: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
  },
  pinStem: {
    width: 2,
    height: 24,
    backgroundColor: colors.accent.amber500,
  },
});
