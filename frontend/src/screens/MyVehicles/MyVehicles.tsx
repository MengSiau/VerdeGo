import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatusIcon } from '@/src/components/StatusIcon';
import { VehicleCard } from '@/src/components/VehicleCard';
import { useVehicles } from '@/src/data/VehiclesStore';
import { fontFamily, radius, screenPaddingX } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';

export function MyVehicles() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const { vehicles, loading, error, refresh, removeVehicle } = useVehicles();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleAdd = () => router.push('/vehicle-form');
  const handleEdit = (vehicleId: string) => router.push({ pathname: '/vehicle-form', params: { vehicleId } });
  const handleRemove = (vehicleId: string, label: string) => {
    if (removing) return;
    Alert.alert('Remove vehicle', `Remove ${label} from your account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        setRemoving(vehicleId);
        try {
          await removeVehicle(vehicleId);
        } catch (e) {
          Alert.alert('Unable to remove vehicle', e instanceof Error ? e.message : 'Please try again.');
        } finally {
          setRemoving(null);
        }
      } },
    ]);
  };

  return (
    <View style={styles.fill}>
      {/* Header is dark in every palette, so the status bar is always light */}
      <StatusBar style="light" />
      <LinearGradient
        colors={[...theme.colors.headerGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color={theme.colors.onHeader} />
          </Pressable>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>My Vehicles</Text>
            <Text style={styles.headerSubtitle}>
              {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} registered
            </Text>
          </View>
          <Pressable
            onPress={handleAdd}
            hitSlop={8}
            style={styles.addButton}
            accessibilityLabel="Add a vehicle"
            accessibilityRole="button">
            <Ionicons name="add" size={24} color={theme.colors.onHeader} />
          </Pressable>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.emptyState}><ActivityIndicator size="large" color={theme.colors.brand} /></View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Unable to load vehicles</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <View style={styles.emptyButton}><PrimaryButton label="Try Again" onPress={() => void refresh()} /></View>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <StatusIcon variant="neutral" size={88} />
          <Text style={styles.emptyTitle}>No vehicles yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your vehicle to start posting rides and track your green impact.
          </Text>
          <View style={styles.emptyButton}>
            <PrimaryButton label="Add a Vehicle" onPress={handleAdd} />
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}>
          {vehicles.map((vehicle) => (
            <View key={vehicle.vehicle_id} style={styles.cardWrap}>
              {removing === vehicle.vehicle_id && <ActivityIndicator color={theme.colors.brand} />}
              <VehicleCard
                vehicle={vehicle}
                onEdit={() => handleEdit(vehicle.vehicle_id)}
                onRemove={() => handleRemove(vehicle.vehicle_id, vehicle.license_plate)}
              />
            </View>
          ))}

          <Pressable
            style={styles.addAnother}
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel="Add another vehicle">
            <Ionicons name="add" size={18} color={theme.colors.brand} />
            <Text style={styles.addAnotherLabel}>Add Another Vehicle</Text>
          </Pressable>
        </ScrollView>
      )}
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      width: 44,
      height: 44,
      marginLeft: -10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextGroup: {
      flex: 1,
    },
    headerTitle: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.onHeader,
    },
    headerSubtitle: {
      marginTop: 2,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.onHeader,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: screenPaddingX.auth,
    },
    emptyTitle: {
      marginTop: 20,
      textAlign: 'center',
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
    },
    emptySubtitle: {
      marginTop: 8,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
    emptyButton: {
      marginTop: 24,
      alignSelf: 'stretch',
    },
    list: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 20,
    },
    cardWrap: {
      marginBottom: 16,
    },
    addAnother: {
      minHeight: 56,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: radius['2xl'],
      borderWidth: 2,
      borderColor: t.colors.brand,
      borderStyle: 'dashed',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addAnotherLabel: {
      flexShrink: 1,
      textAlign: 'center',
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.brand,
    },
  });