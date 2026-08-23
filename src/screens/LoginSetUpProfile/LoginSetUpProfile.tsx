import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { TextField } from '@/src/components/TextField';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

import { ProfilePhotoPicker } from './ProfilePhotoPicker';

type RiderRole = 'ride' | 'drive' | 'both';

const ROLE_OPTIONS: { label: string; value: RiderRole }[] = [
  { label: 'Ride', value: 'ride' },
  { label: 'Drive', value: 'drive' },
  { label: 'Both', value: 'both' },
];

// Demo data standing in for the verified Monash account until account/auth is wired up.
const DEMO_ACCOUNT = {
  fullName: 'Priya Sharma',
  studentId: '32156890',
  verifiedEmail: 'priya.sharma@student.monash.edu',
};

export function LoginSetUpProfile() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<RiderRole>('both');

  return (
    <View style={styles.fill}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Your Profile</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <View style={styles.photoSection}>
          <ProfilePhotoPicker name={DEMO_ACCOUNT.fullName} />
        </View>

        <View style={styles.fieldGroup}>
          <TextField label="Full Name" defaultValue={DEMO_ACCOUNT.fullName} />
        </View>

        <View style={styles.fieldGroup}>
          <TextField label="Student/Staff ID" defaultValue={DEMO_ACCOUNT.studentId} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>I want to...</Text>
          <SegmentedControl options={ROLE_OPTIONS} value={role} onChange={setRole} />
        </View>

        <View style={[styles.fieldGroup, styles.verifiedBanner]}>
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedIcon}>
              <Ionicons name="checkmark" size={12} color={colors.neutral.white} />
            </View>
            <Text style={styles.verifiedHeading}>Monash Verified</Text>
          </View>
          <Text style={styles.verifiedEmail}>{DEMO_ACCOUNT.verifiedEmail}</Text>
        </View>

        {/* TODO: submit profile (name, ID, role, verified email) to backend once account creation exists, then navigate to Home. */}
        <View style={styles.fieldGroup}>
          <PrimaryButton label="Complete Setup" />
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
  content: {
    paddingHorizontal: screenPaddingX.auth,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
  },
  progressTrack: {
    marginTop: 16,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde500,
  },
  photoSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  fieldGroup: {
    marginTop: 24,
  },
  label: {
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  verifiedBanner: {
    borderRadius: radius['2xl'],
    backgroundColor: colors.brand.verde50,
    padding: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedIcon: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedHeading: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
  verifiedEmail: {
    marginTop: 4,
    marginLeft: 28,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.brand.verde600,
  },
});
