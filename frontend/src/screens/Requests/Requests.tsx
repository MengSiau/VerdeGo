import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { acceptRequest, declineRequest, type PendingRequest } from '@/src/api/requests';
import { Avatar } from '@/src/components/Avatar';
import { BottomNav } from '@/src/components/BottomNav';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { Stars } from '@/src/components/Stars';
import type { Ride } from '@/src/data/rides';
import { usePendingRequests } from '@/src/hooks/usePendingRequests';
import { fontFamily, radius, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

// Lists the rides the current user is offering as a driver. Tap one to expand it and
// accept/decline the passenger requests on that ride, without leaving this screen.
export function Requests() {
  const insets = useSafeAreaInsets();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { groups, totalPending, loading, error, refresh } = usePendingRequests();
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

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
      {/* Header is dark in every palette, so the status bar is always light */}
      <StatusBar style="light" />
      <LinearGradient colors={[...theme.colors.headerGradient]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Passenger Requests</Text>
        <Text style={styles.headerSubtitle}>
          {totalPending} pending request{totalPending === 1 ? '' : 's'} across {groups.length} ride
          {groups.length === 1 ? '' : 's'}
        </Text>
      </LinearGradient>

      {loading && groups.length === 0 ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Unable to load requests</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <View style={styles.emptyButton}>
            <PrimaryButton label="Try Again" onPress={() => void refresh()} />
          </View>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={20} color={theme.colors.muted} />
          <Text style={styles.emptyText}>No pending requests right now</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={theme.colors.brand} />
          }>
          {groups.map(({ ride, requests: rideRequests }) => (
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
  const { styles, theme } = useThemedStyles(makeStyles);
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
          color={theme.colors.muted}
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
  const { styles } = useThemedStyles(makeStyles);
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

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    header: {
      paddingHorizontal: screenPaddingX.standard,
      paddingBottom: 20,
    },
    headerTitle: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.onHeader,
    },
    headerSubtitle: {
      marginTop: 4,
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.onHeader,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: screenPaddingX.standard,
      backgroundColor: t.colors.bg,
    },
    emptyTitle: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    emptyText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textAlign: 'center',
    },
    emptyButton: {
      marginTop: 4,
      alignSelf: 'stretch',
    },
    list: {
      backgroundColor: t.colors.bg,
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
      borderColor: t.colors.divider,
      backgroundColor: t.colors.surface,
      padding: 16,
    },
    routeInfo: {
      flex: 1,
      gap: 4,
    },
    routeText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    metaText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    pendingBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: t.colors.accent,
    },
    pendingBadgeText: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onBrand,
    },
    dropdown: {
      marginTop: 10,
      gap: 8,
    },
    card: {
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: t.colors.divider,
      backgroundColor: t.colors.surface,
      padding: 12,
      shadowColor: '#000',
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
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    ratingText: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    pickupTimeColumn: {
      alignItems: 'flex-end',
    },
    pickupLabel: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.textSecondary,
    },
    pickupTime: {
      marginTop: 2,
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
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
