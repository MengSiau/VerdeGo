import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/auth/AuthProvider';
import { CalloutBanner } from '@/src/components/CalloutBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

export function LoginSignIn() {
  const insets = useSafeAreaInsets();
  const { signInWithMonash, signingIn, error } = useAuth();

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
        <Text style={styles.subtitle}>
          We&apos;ll take you to Monash&apos;s secure login to verify your account.
        </Text>

        <View style={styles.section}>
          <CalloutBanner
            variant="info"
            heading="Monash Verified Only"
            body="Only @student.monash.edu or @monash.edu accounts are accepted for safety."
            icon={
              <View style={styles.calloutIcon}>
                <Ionicons name="leaf" size={20} color={colors.brand.verde600} />
              </View>
            }
          />
        </View>

        <View style={styles.section}>
          <PrimaryButton
            label={signingIn ? 'Opening Monash login…' : 'Sign in with Monash'}
            onPress={signInWithMonash}
            disabled={signingIn}
            icon={<MaterialIcons name="account-balance" size={20} color={colors.neutral.white} />}
          />
        </View>

        {error ? (
          <View style={styles.section}>
            <CalloutBanner
              variant="danger"
              heading="Couldn't sign you in"
              body={error}
              icon={
                <View style={styles.errorIcon}>
                  <Ionicons name="alert-circle" size={20} color={colors.neutral.white} />
                </View>
              }
            />
          </View>
        ) : null}

        <Text style={styles.footerText}>
          No separate sign up needed - your Monash account is your VerdeGo account.
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
  section: {
    marginTop: 20,
  },
  calloutIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.verde100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
});