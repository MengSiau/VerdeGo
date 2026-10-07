import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { BottomNav } from '@/src/components/BottomNav';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { Stars } from '@/src/components/Stars';
import { useRidesStore } from '@/src/data/RidesStore';
import type { PassengerRequest } from '@/src/data/requests';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

// draft ride dates are stored "Wed, 13 Aug 2025" - drop the comma and year for the header.
function toShortDate(date: string) {
  const [dow, rest] = date.split(', ');
  const [day, month] = rest?.split(' ') ?? [];
  if (!dow || !day || !month) return date;
  return `${dow} ${day} ${month}`;
}

export function Requests() {
  const insets = useSafeAreaInsets();
  const { rides, requests, acceptRequest, declineRequest } = useRidesStore();

  // All pending requests are against the ride(s) the current user drives. For now there's
  // one, so the header summarises that ride; this would need to group by ride id once a
  // driver can have multiple active postings.
  const ride = requests.length > 0 ? rides.find((r) => r.id === requests[0].rideId) : undefined;
  const seatsAvailable = ride ? ride.seats - ride.confirmedPassengers.length : 0;

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.headerHero} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Passenger Requests</Text>
        {ride && (
          <Text style={styles.headerSubtitle}>
            {ride.pickup.replace(/ Station$/, '')} → Monash · {toShortDate(ride.date)} · {ride.departureTime}
          </Text>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {ride && (
          <Text style={styles.summaryText}>
            {requests.length} pending request{requests.length === 1 ? '' : 's'} · {seatsAvailable} seat
            {seatsAvailable === 1 ? '' : 's'} available
          </Text>
        )}

        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={20} color={colors.neutral.gray400} />
            <Text style={styles.emptyText}>No pending requests</Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={() => acceptRequest(request.id)}
                onDecline={() => declineRequest(request.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav active="requests" />
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
        <Avatar name={request.passengerName} size={44} />
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
        <Ionicons name="location" size={14} color={colors.accent.amber500} />
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
  body: {
    flexGrow: 1,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    paddingBottom: 20,
  },
  summaryText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  cardsList: {
    marginTop: 16,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
  },
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    backgroundColor: colors.neutral.white,
    padding: 16,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passengerInfo: {
    flex: 1,
    gap: 4,
  },
  passengerName: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
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
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutral.gray50,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickupText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  actionFlex: {
    flex: 1,
  },
});
