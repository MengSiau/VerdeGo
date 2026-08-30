import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalloutBanner } from '@/src/components/CalloutBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProgressBar } from '@/src/components/ProgressBar';
import { TextField } from '@/src/components/TextField';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';
import { Button } from 'react-native';
import { useAuth } from '@/src/auth/AuthProvider';


const TOTAL_STEPS = 2;
const CURRENT_STEP = 2;

export function ProfileSetup() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // inside the component
  const { signOut } = useAuth();



  // Avatar initials: first letter of first name + first letter of last name, e.g. "Priya Sharma" -> "PS".
  const initials = useMemo(() => {
    const first = firstName.trim().charAt(0);
    const last = lastName.trim().charAt(0);
    return (first + last).toUpperCase();
  }, [firstName, lastName]);

  const handleComplete = () => {
    // TODO: wire up to backend once auth is connected.
    router.push('/');
  };

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
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.stepLabel}>
            Step {CURRENT_STEP} of {TOTAL_STEPS}
          </Text>
        </View>
        <View style={styles.progressWrap}>
          <ProgressBar step={CURRENT_STEP} totalSteps={TOTAL_STEPS} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials || ''}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="add" size={16} color={colors.neutral.white} />
            </View>
          </View>
          <Text style={styles.avatarCaption}>Tap to upload photo</Text>
        </View>

        <View style={styles.fieldGroup}>
          <TextField
            label="First Name"
            placeholder="First Name"
            autoComplete="given-name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <TextField
            label="Last Name"
            placeholder="Last Name"
            autoComplete="family-name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <TextField
            label="Student/Staff ID"
            placeholder="Student/Staff ID"
            keyboardType="number-pad"
            value={studentId}
            onChangeText={setStudentId}
          />
        </View>

        <View style={styles.fieldGroup}>
          <TextField
            label="Create Password"
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password-new"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <TextField
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password-new"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <CalloutBanner
            variant="info"
            heading="Monash Verified"
            body={email ?? ''}
            icon={<Ionicons name="checkmark-circle" size={24} color={colors.brand.verde600} />}
          />
        </View>

        <View style={styles.fieldGroup}>
          <PrimaryButton label="Complete Setup" onPress={handleComplete} />
        </View>

        <View style={styles.fieldGroup}>
          <Button title="Sign out (temp)" onPress={signOut} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
  },
  stepLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  progressWrap: {
    marginTop: 12,
  },
  avatarSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 96,
    height: 96,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde200,
    borderWidth: 2,
    borderColor: colors.brand.verde400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize['2xl'],
    color: colors.brand.verde700,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde600,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  avatarCaption: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  fieldGroup: {
    marginTop: 20,
  },
});
