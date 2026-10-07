import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { BottomNav } from '@/src/components/BottomNav';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { Stars } from '@/src/components/Stars';
import { CURRENT_USER_ID } from '@/src/data/currentUser';
import { useRidesStore } from '@/src/data/RidesStore';
import type { PassengerRequest } from '@/src/data/requests';
import type { Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

// draft ride dates are stored "Wed, 13 Aug 2025" - drop the comma and year for list rows.
function toShortDate(date: string) {
  const [dow, rest] = date.split(', ');
  const [day, month] = rest?.split(' ') ?? [];
  if (!dow || !day || !month) return date;
  return `${dow} ${day} ${month}`;
}

// Lists the rides the current user is offering as a driver. Tap one to expand it and
// accept/decline the passenger requests on that ride, without leaving this screen.
export function Requests() {
  const insets = useSafeAreaInsets();
  const { rides, requests, acceptRequest, declineRequest } = useRidesStore();
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);

  const offeredRides = useMemo(() => rides.filter((r) => r.driverId === CURRENT_USER_ID), [rides]);

  const requestsByRide = useMemo(() => {
    const map: Record<string, PassengerRequest[]> = {};
    for (const request of requests) {
      (map[request.rideId] ??= []).push(request);
    }
    return map;
  }, [requests]);

  const totalPending = requests.length;

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.headerHero} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Passenger Requests</Text>
        <Text style={styles.headerSubtitle}>
          {totalPending} pending request{totalPending === 1 ? '' : 's'} across {offeredRides.length} ride
          {offeredRides.length === 1 ? '' : 's'}
        </Text>
      </LinearGradient>

      {offeredRides.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={20} color={colors.neutral.gray400} />
          <Text style={styles.emptyText}>You haven&apos;t posted any rides yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}>
          {offeredRides.map((ride) => (
            <RideAccordion
              key={ride.id}
              ride={ride}
              requests={requestsByRide[ride.id] ?? []}
              expanded={expandedRideId === ride.id}
              onToggle={() => setExpandedRideId((prev) => (prev === ride.id ? null : ride.id))}
              onAccept={acceptRequest}
              onDecline={declineRequest}
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
  onToggle,
  onAccept,
  onDecline,
}: {
  ride: Ride;
  requests: PassengerRequest[];
  expanded: boolean;
  onToggle: () => void;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}) {
  const seatsAvailable = ride.seats - ride.confirmedPassengers.length;
  const pendingCount = requests.length;

  return (
    <View>
      <Pressable onPress={onToggle} style={styles.row} accessibilityRole="button" accessibilityState={{ expanded }}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>{ride.pickup.replace(/ Station$/, '')} → Monash</Text>
          <Text style={styles.metaText}>
            {toShortDate(ride.date)} · {ride.departureTime} · {seatsAvailable} seat
            {seatsAvailable === 1 ? '' : 's'} available
          </Text>
        </View>

        {pendingCount > 0 ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} new</Text>
          </View>
        ) : (
          <Text style={styles.noRequestsText}>No requests</Text>
        )}

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.neutral.gray300}
        />
      </Pressable>

      {expanded && (
        <View style={styles.dropdown}>
          {requests.length === 0 ? (
            <Text style={styles.noRequestsExpandedText}>No pending requests for this ride.</Text>
          ) : (
            requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={() => onAccept(request.id)}
                onDecline={() => onDecline(request.id)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: PassengerRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Avatar name={request.passengerName} size={36} />
        <View style={styles.passengerInfo}>
          <Text style={styles.passengerName}>{request.passengerName}</Text>
          <View style={styles.ratingRow}>
            <Stars rating={request.rating} size={14} />
            <Text style={styles.ratingText}>{request.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.pickupTimeColumn}>
          <Text style={styles.pickupLabel}>Pickup</Text>
          <Text style={styles.pickupTime}>{request.pickupTime}</Text>
        </View>
      </View>

      <View style={styles.pickupRow}>
        <Ionicons name="location" size={12} color={colors.accent.amber500} />
        <Text style={styles.pickupText}>{request.pickup}</Text>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionFlex}>
          <SecondaryButton variant="destructive" label="Decline" onPress={onDecline} />
        </View>
        <View style={styles.actionFlex}>
          <PrimaryButton label="Accept" onPress={onAccept} />
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
    backgroundColor: colors.neutral.white,
  },
  emptyText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
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
  noRequestsText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray400,
  },
  dropdown: {
    marginTop: 10,
    gap: 8,
  },
  noRequestsExpandedText: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
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
  pickupRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pickupText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.neutral.gray700,
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
