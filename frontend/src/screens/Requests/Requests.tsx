import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { acceptRequest, declineRequest, type PendingRequest } from '@/src/api/requests';
import { Avatar } from '@/src/components/Avatar';
import { BottomNav } from '@/src/components/BottomNav';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { Stars } from '@/src/components/Stars';
import { mapRideWithDetailsToRide } from '@/src/data/browseRides';
import type { Ride } from '@/src/data/rides';
import { usePendingRequests } from '@/src/hooks/usePendingRequests';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

// Lists the rides the current user is offering as a driver. Tap one to expand it and
// accept/decline the passenger requests on that ride, without leaving this screen.
export function Requests() {
  const insets = useSafeAreaInsets();
  const { requests, loading, error, refresh } = usePendingRequests();
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const groupedByRide = useMemo(() => {
    const map = new Map<string, { ride: Ride; requests: PendingRequest[] }>();
    for (const item of requests) {
      const rideId = item.ride.ride_id;
      if (!map.has(rideId)) {
        map.set(rideId, { ride: mapRideWithDetailsToRide(item), requests: [] });
      }
      map.get(rideId)!.requests.push(item);
    }
    return Array.from(map.values());
  }, [requests]);

  const totalPending = requests.length;

  const handleAccept = async (item: PendingRequest) => {
    setRespondingId(item.ride_passenger_id);
    try {
      await acceptRequest(item.ride_passenger_id);
      await refresh();
    } catch (e) {
      Alert.alert('Unable to accept request', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleDecline = async (item: PendingRequest) => {
    setRespondingId(item.ride_passenger_id);
    try {
      await declineRequest(item.ride_passenger_id);
      await refresh();
    } catch (e) {
      Alert.alert('Unable to decline request', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.headerHero} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Passenger Requests</Text>
        <Text style={styles.headerSubtitle}>
          {totalPending} pending request{totalPending === 1 ? '' : 's'} across {groupedByRide.length} ride
          {groupedByRide.length === 1 ? '' : 's'}
        </Text>
      </LinearGradient>

      {loading && requests.length === 0 ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.brand.verde600} />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Unable to load requests</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <View style={styles.emptyButton}>
            <PrimaryButton label="Try Again" onPress={() => void refresh()} />
          </View>
        </View>
      ) : groupedByRide.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={20} color={colors.neutral.gray400} />
          <Text style={styles.emptyText}>No pending requests right now</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}>
          {groupedByRide.map(({ ride, requests: rideRequests }) => (
            <RideAccordion
              key={ride.id}
              ride={ride}
              requests={rideRequests}
              expanded={expandedRideId === ride.id}
              respondingId={respondingId}
              onToggle={() => setExpandedRideId((prev) => (prev === ride.id ? null : ride.id))}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </ScrollView>
      )}

      <BottomNav active="requests" />
    </View>
  );
}

function RideAccordion({
  ride,
  requests,
  expanded,
  respondingId,
  onToggle,
  onAccept,
  onDecline,
}: {
  ride: Ride;
  requests: PendingRequest[];
  expanded: boolean;
  respondingId: string | null;
  onToggle: () => void;
  onAccept: (item: PendingRequest) => void;
  onDecline: (item: PendingRequest) => void;
}) {
  const pendingCount = requests.length;

  return (
    <View>
      <Pressable onPress={onToggle} style={styles.row} accessibilityRole="button" accessibilityState={{ expanded }}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>{ride.pickup} → Monash</Text>
          <Text style={styles.metaText}>
            {ride.date} · {ride.departureTime} · {ride.seats} seat{ride.seats === 1 ? '' : 's'} available
          </Text>
        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{pendingCount} new</Text>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.neutral.gray300}
        />
      </Pressable>

      {expanded && (
        <View style={styles.dropdown}>
          {requests.map((request) => (
            <RequestCard
              key={request.ride_passenger_id}
              request={request}
              departureTime={ride.departureTime}
              responding={respondingId === request.ride_passenger_id}
              onAccept={() => onAccept(request)}
              onDecline={() => onDecline(request)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function RequestCard({
  request,
  departureTime,
  responding,
  onAccept,
  onDecline,
}: {
  request: PendingRequest;
  departureTime: string;
  responding: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { passenger } = request;

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Avatar name={passenger.name} size={36} />
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerName}>{passenger.name}</Text>
          <View style={styles.ratingRow}>
            <Stars rating={passenger.rating} size={14} />
            <Text style={styles.ratingText}>{passenger.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.pickupTimeColumn}>
          <Text style={styles.pickupLabel}>Departs</Text>
          <Text style={styles.pickupTime}>{departureTime}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionFlex}>
          <SecondaryButton variant="destructive" label="Decline" disabled={responding} onPress={onDecline} />
        </View>
        <View style={styles.actionFlex}>
          <PrimaryButton label={responding ? 'Working...' : 'Accept'} disabled={responding} onPress={onAccept} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenPaddingX.standard,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  headerSubtitle: {
    marginTop: 4,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: screenPaddingX.standard,
    backgroundColor: colors.neutral.white,
  },
  emptyTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray800,
  },
  emptyText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 4,
    alignSelf: 'stretch',
  },
  list: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    backgroundColor: colors.neutral.white,
    padding: 16,
  },
  routeInfo: {
    flex: 1,
    gap: 4,
  },
  routeText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  metaText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber400,
  },
  pendingBadgeText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.neutral.white,
  },
  dropdown: {
    marginTop: 10,
    gap: 8,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    backgroundColor: colors.neutral.white,
    padding: 12,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passengerInfo: {
    flex: 1,
    gap: 2,
  },
  passengerName: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  pickupTimeColumn: {
    alignItems: 'flex-end',
  },
  pickupLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  pickupTime: {
    marginTop: 2,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionFlex: {
    flex: 1,
  },
});
