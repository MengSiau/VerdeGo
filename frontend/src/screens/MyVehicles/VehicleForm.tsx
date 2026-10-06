import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SelectField } from '@/src/components/SelectField';
import { TextField } from '@/src/components/TextField';
import { useVehicles } from '@/src/data/VehiclesStore';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

export function VehicleForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles, models, loading, error, refresh, addVehicle, updateVehicle } = useVehicles();
  const existingVehicle = vehicles.find((vehicle) => vehicle.vehicle_id === vehicleId);
  const isEditing = Boolean(vehicleId);
  const [modelId, setModelId] = useState(existingVehicle?.model_id ?? '');
  const [plate, setPlate] = useState(existingVehicle?.license_plate ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingVehicle) {
      setModelId(existingVehicle.model_id);
      setPlate(existingVehicle.license_plate);
    }
  }, [existingVehicle?.vehicle_id]);

  const modelLabel = (model: typeof models[number]) => `${model.year} ${model.make} ${model.model}`;
  const selectedModel = models.find((model) => model.model_id === modelId);
  const normalizedPlate = plate.trim().toUpperCase();
  const isValid = Boolean(selectedModel && normalizedPlate && normalizedPlate.length <= 20);

  const handleSave = async () => {
    if (!isValid || saving) return;
    if (vehicles.some((vehicle) => vehicle.vehicle_id !== vehicleId && vehicle.license_plate.trim().toUpperCase() === normalizedPlate)) {
      Alert.alert('License plate already registered', 'This plate is already on one of your vehicles.');
      return;
    }
    setSaving(true);
    try {
      const input = { model_id: modelId, license_plate: normalizedPlate };
      if (vehicleId) await updateVehicle(vehicleId, input);
      else await addVehicle(input);
      router.back();
    } catch (e) {
      Alert.alert('Unable to save vehicle', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.headerHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} disabled={saving} hitSlop={8} style={styles.backButton}
            accessibilityLabel="Go back" accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color={colors.neutral.white} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
            <Text style={styles.headerSubtitle}>Enter your vehicle details</Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView style={styles.fill} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled">
        {loading ? <ActivityIndicator size="large" color={colors.brand.verde600} /> : error ? (
          <View>
            <Text style={styles.fieldLabel}>{error}</Text>
            <PrimaryButton label="Try Again" onPress={() => void refresh()} />
          </View>
        ) : isEditing && !existingVehicle ? (
          <Text style={styles.fieldLabel}>Vehicle not found.</Text>
        ) : models.length === 0 ? (
          <Text style={styles.fieldLabel}>No vehicle models are available yet.</Text>
        ) : (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>VEHICLE INFO</Text>
              <View style={styles.fieldGroup}>
                <SelectField label="Vehicle Model" placeholder="Select your vehicle..."
                  value={selectedModel ? modelLabel(selectedModel) : null}
                  options={models.map(modelLabel)}
                  onChange={(label) => setModelId(models.find((model) => modelLabel(model) === label)?.model_id ?? '')} />
              </View>
              <View style={styles.fieldGroup}>
                <TextField label="Number Plate" placeholder="e.g. ABC 123" autoCapitalize="characters"
                  value={plate} onChangeText={setPlate} />
              </View>
              {normalizedPlate.length > 20 && <Text style={styles.fieldLabel}>Number plate must be at most 20 characters.</Text>}
            </View>
            <PrimaryButton label={saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Vehicle'}
              onPress={handleSave} disabled={!isValid || saving} />
          </View>
        )}
      </ScrollView>
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
    gap: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
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
  content: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 20,
  },
  section: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.xs,
    color: colors.neutral.gray400,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  fieldGroup: {
    marginTop: 16,
  },
  fieldLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
});
