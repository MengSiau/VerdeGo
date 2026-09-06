import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalloutBanner } from '@/src/components/CalloutBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { TextField } from '@/src/components/TextField';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

export function LoginSignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Demo shortcut: Sign In implies an existing account, so go straight to Home
  // until real account lookup/auth exists.
  const goToHome = () => router.push('/home');

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
        <Text style={styles.title}>Sign In</Text>
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
          />
        </View>

        <View style={styles.fieldGroup}>
          <TextField label="Password" placeholder="••••••••" secureTextEntry autoComplete="password" />
        </View>

        <View style={styles.fieldGroup}>
          <PrimaryButton label="Continue with Monash" onPress={goToHome} />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <SecondaryButton
          label="Sign in with Monash SSO"
          icon={<MaterialIcons name="account-balance" size={20} color={colors.neutral.gray700} />}
        />

        <Text style={styles.footerText}>

          Don&apos;t have an account?{' '}
          <Text style={styles.footerLink} onPress={() => router.push('/signup-email')}>
            Sign up          </Text>
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
  divider: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral.gray200,
  },
  dividerText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
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
