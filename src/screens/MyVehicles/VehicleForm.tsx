import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalloutBanner } from '@/src/components/CalloutBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SelectField } from '@/src/components/SelectField';
import { TextField } from '@/src/components/TextField';
import { type FuelType, useVehicles } from '@/src/data/TempVehicleContext';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX, tapTarget } from '@/src/theme';

const MAKES = [
  'Toyota',
  'Honda',
  'Mazda',
  'Hyundai',
  'Kia',
  'Ford',
  'Nissan',
  'Subaru',
  'Mitsubishi',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Tesla',
  'Other',
];

const SEATS = ['2', '4', '5', '6', '7', '8'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 25 }, (_, i) => String(CURRENT_YEAR - i));

const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

const FUEL_ACCENT_COLOR: Record<FuelType, string> = {
  Petrol: colors.semantic.danger,
  Diesel: colors.neutral.gray700,
  Hybrid: colors.brand.verde600,
  Electric: colors.accent.amber500,
};

function FuelIcon({ type, color, size = 16 }: { type: FuelType; color: string; size?: number }) {
  switch (type) {
    case 'Petrol':
      return <MaterialCommunityIcons name="gas-station" size={size} color={color} />;
    case 'Diesel':
      return <MaterialCommunityIcons name="barrel" size={size} color={color} />;
    case 'Hybrid':
      return <Ionicons name="leaf" size={size} color={color} />;
    case 'Electric':
      return <Ionicons name="flash" size={size} color={color} />;
  }
}

export function VehicleForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { vehicles, addVehicle, updateVehicle } = useVehicles();

  const existingVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === vehicleId),
    [vehicles, vehicleId]
  );
  const isEditing = Boolean(existingVehicle);

  const [make, setMake] = useState(existingVehicle?.make ?? '');
  const [model, setModel] = useState(existingVehicle?.model ?? '');
  const [year, setYear] = useState(existingVehicle?.year ?? String(CURRENT_YEAR));
  const [seats, setSeats] = useState(existingVehicle?.seats ?? '4');
  const [colour, setColour] = useState(existingVehicle?.colour ?? '');
  const [fuelType, setFuelType] = useState<FuelType | null>(existingVehicle?.fuelType ?? null);
  const [plate, setPlate] = useState(existingVehicle?.plate ?? '');

  const isValid = Boolean(make && model.trim() && colour.trim() && fuelType && plate.trim());

  const handleSave = () => {
    if (!isValid || !fuelType) return;
    const input = {
      make,
      model: model.trim(),
      year,
      seats,
      colour: colour.trim(),
      fuelType,
      plate: plate.trim().toUpperCase(),
    };
    if (isEditing && existingVehicle) {
      updateVehicle(existingVehicle.id, input);
    } else {
      addVehicle(input);
    }
    router.back();
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
          <View>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update your vehicle details' : 'Enter your vehicle details'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>VEHICLE INFO</Text>

          <View style={styles.fieldGroup}>
            <SelectField
              label="Make"
              placeholder="Select make..."
              value={make || null}
              options={MAKES}
              onChange={setMake}
            />
          </View>

          <View style={styles.fieldGroup}>
            <TextField label="Model" placeholder="e.g. Corolla Hybrid" value={model} onChangeText={setModel} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowField}>
              <SelectField
                label="Year"
                placeholder="Select year..."
                value={year || null}
                options={YEARS}
                onChange={setYear}
              />
            </View>
            <View style={styles.rowField}>
              <SelectField
                label="Seats"
                placeholder="Select seats..."
                value={seats || null}
                options={SEATS}
                onChange={setSeats}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <TextField label="Colour" placeholder="e.g. Pearl White" value={colour} onChangeText={setColour} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FUEL & REGISTRATION</Text>

          <Text style={styles.fieldLabel}>Fuel Type</Text>
          <View style={styles.fuelGrid}>
            {FUEL_TYPES.map((type) => {
              const selected = fuelType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setFuelType(type)}
                  style={[styles.fuelOption, selected && styles.fuelOptionSelected]}>
                  <View style={styles.fuelIconChip}>
                    <FuelIcon type={type} color={FUEL_ACCENT_COLOR[type]} />
                  </View>
                  <Text style={[styles.fuelLabel, selected && styles.fuelLabelSelected]}>{type}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fieldGroup}>
            <TextField
              label="Number Plate"
              placeholder="e.g. ABC 123"
              autoCapitalize="characters"
              value={plate}
              onChangeText={setPlate}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <CalloutBanner
            variant="info"
            heading="Green Score"
            body="Your vehicle details are used to calculate your Green Score for each ride using real emissions data. Only passengers you match with can see your car."
            icon={<Ionicons name="sparkles" size={20} color={colors.brand.verde600} />}
          />
        </View>

        <View style={styles.fieldGroup}>
          <PrimaryButton
            label={isEditing ? 'Save Changes' : 'Save Vehicle'}
            onPress={handleSave}
            disabled={!isValid}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  rowField: {
    flex: 1,
  },
  fieldLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  fuelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fuelOption: {
    width: '47%',
    minHeight: tapTarget.minimum,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  fuelOptionSelected: {
    borderColor: colors.brand.verde600,
    backgroundColor: colors.brand.verde500,
  },
  fuelIconChip: {
    width: 28,
    height: 28,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuelLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  fuelLabelSelected: {
    color: colors.neutral.white,
  },
});
