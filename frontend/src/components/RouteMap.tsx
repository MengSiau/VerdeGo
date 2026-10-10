import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { Coordinate } from '@/src/hooks/UseReverseGeocode';
import { colors } from '@/src/theme';

export type { Coordinate };

type RouteMapProps = {
  origin: Coordinate;
  destination: Coordinate;
  path?: Coordinate[];
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A path point further than this from the trip's midpoint is bad data, not a detour. */
const MAX_DEGREES_FROM_MIDPOINT = 1.5;

export function RouteMap({ origin, destination, path, interactive = false, style }: RouteMapProps) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const midLat = (origin.latitude + destination.latitude) / 2;
  const midLng = (origin.longitude + destination.longitude) / 2;

  // One stray decoded point would drag the camera across the state, so anything
  // implausibly far from the trip is dropped before it reaches the map.
  const cleanPath = useMemo(() => {
    if (!path || path.length < 2) return undefined;
    const kept = path.filter(
      (p) =>
        Math.abs(p.latitude - midLat) < MAX_DEGREES_FROM_MIDPOINT &&
        Math.abs(p.longitude - midLng) < MAX_DEGREES_FROM_MIDPOINT,
    );
    return kept.length > 1 ? kept : undefined;
  }, [path, midLat, midLng]);

  const coordinates = useMemo(
    () => cleanPath ?? [origin, destination],
    [cleanPath, origin, destination],
  );

  const fit = useCallback(() => {
    if (!ready || size.width === 0 || size.height === 0) return;

    // Padding proportional to the view: 60px of inset on a 160px-tall preview
    // leaves almost nothing to draw in, which itself forces a zoom out.
    const padX = Math.max(16, Math.min(60, size.width * 0.12));
    const padY = Math.max(16, Math.min(60, size.height * 0.12));

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: padY, right: padX, bottom: padY, left: padX },
      animated: false,
    });
  }, [ready, size.width, size.height, coordinates]);

  useEffect(() => {
    fit();
    // Apple Maps occasionally ignores the first fit on a freshly mounted map,
    // so one cheap retry once it has definitely settled.
    const retry = setTimeout(fit, 400);
    return () => clearTimeout(retry);
  }, [fit]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  return (
    <View style={style} pointerEvents={interactive ? 'auto' : 'none'} onLayout={onLayout}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        onMapReady={() => setReady(true)}
        initialRegion={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(0.02, Math.abs(origin.latitude - destination.latitude) * 1.5),
          longitudeDelta: Math.max(0.02, Math.abs(origin.longitude - destination.longitude) * 1.5),
        }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        showsCompass={interactive}
        showsMyLocationButton={false}>
        <Marker coordinate={origin} pinColor="orange" title="Pick up" />
        <Marker coordinate={destination} pinColor="green" title="Drop off" />

        {cleanPath ? (
          <Polyline coordinates={cleanPath} strokeColor={colors.brand.verde600} strokeWidth={4} />
        ) : (
          <Polyline
            coordinates={[origin, destination]}
            strokeColor={colors.brand.verde600}
            strokeWidth={3}
            lineDashPattern={[6, 6]}
          />
        )}
      </MapView>
    </View>
  );
}