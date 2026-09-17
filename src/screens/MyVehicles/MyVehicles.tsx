import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatusIcon } from '@/src/components/StatusIcon';
import { VehicleCard } from '@/src/components/VehicleCard';
import { useVehicles } from '@/src/data/TempVehicleContext';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

export function MyVehicles() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vehicles, removeVehicle } = useVehicles();

  const handleAdd = () => router.push('/vehicle-form');
  const handleEdit = (vehicleId: string) => router.push({ pathname: '/vehicle-form', params: { vehicleId } });
  const handleRemove = (vehicleId: string, label: string) => {
    Alert.alert('Remove vehicle', `Remove ${label} from your account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeVehicle(vehicleId) },
    ]);
  };

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient
        colors={gradients.headerHero}
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
            <Ionicons name="chevron-back" size={24} color={colors.neutral.white} />
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
            <Ionicons name="add" size={24} color={colors.neutral.white} />
          </Pressable>
        </View>
      </LinearGradient>

      {vehicles.length === 0 ? (
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
            <View key={vehicle.id} style={styles.cardWrap}>
              <VehicleCard
                vehicle={vehicle}
                onEdit={() => handleEdit(vehicle.id)}
                onRemove={() => handleRemove(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
              />
            </View>
          ))}

          <Pressable style={styles.addAnother} onPress={handleAdd}>
            <Ionicons name="add" size={18} color={colors.brand.verde700} />
            <Text style={styles.addAnotherLabel}>Add Another Vehicle</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
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
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  headerSubtitle: {
    marginTop: 2,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
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
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.neutral.gray900,
  },
  emptySubtitle: {
    marginTop: 8,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 20,
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
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: colors.brand.verde300,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addAnotherLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.brand.verde700,
  },
});
