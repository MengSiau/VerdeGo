import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ComboBox } from '@/src/components/ComboBox';
import { GreenScoreBadge } from '@/src/components/GreenScoreBadge';
import { getVehicleMakes, getVehicleModels, getModelEmissions, type VehicleMake, type VehicleModel, type VehicleCatalogueModel } from '@/src/api/vehicles';
import { getGreenScore } from '@/src/utils/greenScore';
import { TextField } from '@/src/components/TextField';
import { useVehicles } from '@/src/data/VehiclesStore';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

export function VehicleForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles, loading, error, refresh, addVehicle, updateVehicle } = useVehicles();
  const existingVehicle = vehicles.find((vehicle) => vehicle.vehicle_id === vehicleId);
  const isEditing = Boolean(vehicleId);
  const [make, setMake] = useState(existingVehicle?.vehicle_models?.make ?? '');
  const [modelId, setModelId] = useState(existingVehicle?.model_id ?? '');
  const [year, setYear] = useState(existingVehicle?.vehicle_models?.year.toString() ?? '');
  const [plate, setPlate] = useState(existingVehicle?.license_plate ?? '');
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleCatalogueModel[]>([]);
  const [makesLoading, setMakesLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [details, setDetails] = useState<VehicleModel | null>(null);
  const [emissionsLoading, setEmissionsLoading] = useState(false);
  const [emissionsError, setEmissionsError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(Boolean(existingVehicle));

  useEffect(() => {
    if (existingVehicle && !initialized.current) {
      initialized.current = true;
      setMake(existingVehicle.vehicle_models?.make ?? '');
      setModelId(existingVehicle.model_id);
      setPlate(existingVehicle.license_plate);
      setYear(existingVehicle.vehicle_models?.year.toString() ?? '');
    }
  }, [existingVehicle]);

  // Load makes once on mount; retries only happen when explicitly requested.
  useEffect(() => {
    let cancelled = false;
    setMakesLoading(true);
    setCatalogueError(null);
    getVehicleMakes().then((data) => {
      if (!cancelled) setMakes(data);
    }).catch((e) => {
      if (!cancelled) setCatalogueError(e instanceof Error ? e.message : 'Unable to load makes.');
    }).finally(() => {
      if (!cancelled) setMakesLoading(false);
    });
    return () => { cancelled = true; };
  }, [retry]);

  useEffect(() => {
    let cancelled = false;
    setModels([]);
    setCatalogueError(null);
    if (!make) {
      setModelsLoading(false);
      return () => { cancelled = true; };
    }
    setModelsLoading(true);
    getVehicleModels(make).then((data) => {
      if (!cancelled) {
        setModels(data);
        if (existingVehicle && modelId === existingVehicle.model_id) {
          const match = data.find((item) => item.model === existingVehicle.vehicle_models?.model);
          if (match) setModelId(match.model_id);
        }
      }
    }).catch((e) => {
      if (!cancelled) setCatalogueError(e instanceof Error ? e.message : 'Unable to load models.');
    }).finally(() => {
      if (!cancelled) setModelsLoading(false);
    });
    return () => { cancelled = true; };
  }, [make, retry]);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setEmissionsError(null);
    const catalogueModel = models.find((item) => item.model_id === modelId);
    if (!catalogueModel || !year) {
      setEmissionsLoading(false);
      return () => { cancelled = true; };
    }
    setEmissionsLoading(true);
    getModelEmissions(modelId, Number(year), make, catalogueModel.model).then((data) => {
      if (!cancelled) setDetails(data);
    }).catch((e) => {
      if (!cancelled) setEmissionsError(e instanceof Error ? e.message : 'Unable to estimate emissions.');
    }).finally(() => {
      if (!cancelled) setEmissionsLoading(false);
    });
    return () => { cancelled = true; };
  }, [modelId, year, make, models, retry]);

  const handleMakeChange = (nextMake: string) => {
    if (nextMake === make) return;
    setMake(nextMake);
    setModelId('');
    setYear('');
    setModels([]);
    setDetails(null);
    setEmissionsError(null);
    setModelsLoading(true);
  };
  const selectedModel = details && details.make === make && details.year === Number(year) ? details : null;
  const normalizedPlate = plate.trim().toUpperCase();
  const isValid = Boolean(selectedModel?.co2_g_per_km != null && normalizedPlate && normalizedPlate.length <= 20 && !modelsLoading);

  const handleSave = async () => {
    if (!isValid || !selectedModel || saving) return;
    if (vehicles.some((vehicle) => vehicle.vehicle_id !== vehicleId && vehicle.license_plate.trim().toUpperCase() === normalizedPlate)) {
      Alert.alert('License plate already registered', 'This plate is already on one of your vehicles.');
      return;
    }
    setSaving(true);
    try {
      const input = { model_id: selectedModel.model_id, license_plate: normalizedPlate };
      if (vehicleId) await updateVehicle(vehicleId, input, selectedModel);
      else await addVehicle(input, selectedModel);
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
        ) : (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>VEHICLE INFO</Text>
              <View style={styles.fieldGroup}>
                <ComboBox label="Make" placeholder={makesLoading ? 'Loading makes...' : 'Select make...'}
                  value={make || null} options={makes.map((item) => ({ value: item.name, label: item.name }))}
                  disabled={makesLoading || saving} onChange={handleMakeChange} />
              </View>
              <View style={styles.fieldGroup}>
                <ComboBox label="Model" placeholder={modelsLoading ? 'Loading models...' : 'Select model...'}
                  value={modelId || null} options={models.map((model) => ({ value: model.model_id, label: model.model }))}
                  disabled={!make || modelsLoading || saving}
                  onChange={(id) => { if (id !== modelId) { setModelId(id); setDetails(null); setYear(''); } }} />
              </View>
              <View style={styles.fieldGroup}>
                <ComboBox label="Year" placeholder="Select year..." value={year || null}
                  options={Array.from({ length: new Date().getFullYear() - 1885 }, (_, index) => {
                    const value = String(new Date().getFullYear() - index);
                    return { value, label: value };
                  })}
                  disabled={!modelId || modelsLoading || saving}
                  onChange={(value) => { if (value !== year) { setYear(value); setDetails(null); } }} />
              </View>
              {!makesLoading && makes.length === 0 && !catalogueError && <Text style={styles.fieldLabel}>No makes available.</Text>}
              {make && !modelsLoading && models.length === 0 && !catalogueError && <Text style={styles.fieldLabel}>No models available for this make.</Text>}
              {catalogueError && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{catalogueError}</Text>
                  <PrimaryButton label="Try Again" onPress={() => setRetry((value) => value + 1)} />
                </View>
              )}
              {emissionsLoading && <ActivityIndicator style={styles.fieldGroup} color={colors.brand.verde600} />}
              {emissionsError && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{emissionsError}</Text>
                  <PrimaryButton label="Retry Estimate" onPress={() => setRetry((value) => value + 1)} />
                </View>
              )}
              {selectedModel?.co2_g_per_km != null && (
                <View style={styles.summary}>
                  <GreenScoreBadge grade={getGreenScore(selectedModel.co2_g_per_km)} size={44} />
                  <View>
                    <Text style={styles.fieldLabel}>Green Score</Text>
                    <Text style={styles.emissions}>{selectedModel.co2_g_per_km.toFixed(2)} g CO2e/km</Text>
                    
                  </View>
                </View>
              )}
              <View style={styles.fieldGroup}>
                <TextField label="Number Plate" placeholder="e.g. ABC 123" autoCapitalize="characters"
                  value={plate} onChangeText={setPlate} editable={!saving} />
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
  summary: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  emissions: { fontFamily: fontFamily.bodyRegular, fontSize: fontSize.sm, color: colors.neutral.gray700 },
  fieldLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
});
