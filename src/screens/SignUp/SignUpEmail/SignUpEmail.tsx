import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalloutBanner } from '@/src/components/CalloutBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { TextField } from '@/src/components/TextField';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

// Domains accepted for VerdeGo sign-up. Front-end check only - no backend/auth wired up yet.
const ACCEPTED_DOMAINS = ['@student.monash.edu', '@monash.edu'];

function isMonashEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return ACCEPTED_DOMAINS.some((domain) => normalized.endsWith(domain));
}

export function SignUpEmail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleVerify = () => {
    const status = isMonashEmail(email) ? 'success' : 'error';
    router.push({ pathname: '/verify-email', params: { email, status } });
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
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Use your Monash University email to get started.</Text>

        <CalloutBanner
          variant="info"
          heading="Monash Verified Only"
          body="Only @student.monash.edu or @monash.edu emails are accepted for safety."
          icon={
            <View style={styles.calloutIcon}>
              <Ionicons name="leaf" size={20} color={colors.brand.verde600} />
            </View>
          }
        />

        <View style={styles.fieldGroup}>
          <TextField
            label="University Email"
            placeholder="you@student.monash.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <PrimaryButton label="Verify" onPress={handleVerify} />
        </View>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => router.push('/login-signin')}>
            Sign in
          </Text>
        </Text>
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
  subtitle: {
    marginTop: 6,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  calloutIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.verde100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginTop: 20,
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  footerLink: {
    fontFamily: fontFamily.headingSemibold,
    color: colors.brand.verde700,
  },
});
