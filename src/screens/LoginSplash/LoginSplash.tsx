import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoPlaceholder } from '@/src/components/LogoPlaceholder';
import { colors, fontFamily, fontSize, gradients, screenPaddingX } from '@/src/theme';

import { SplashPrimaryButton } from './SplashPrimaryButton';
import { SplashSecondaryButton } from './SplashSecondaryButton';

export function LoginSplash() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goToSignIn = () => router.push('/login-signin'); // Routes based on the filename structure in the app directory!

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />
      <LinearGradient
        colors={gradients.splash}
        locations={gradients.splashLocations}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={styles.fill}>
        <View style={styles.content}>
          <LogoPlaceholder />

          <Text style={styles.title}>VerdeGo</Text>

          <Text style={styles.tagline}>Ride together.{'\n'}Travel greener.</Text>

          <Text style={styles.subtext}>
            Connecting Monash students & staff for smarter, sustainable commutes.
          </Text>
        </View>

        <View style={[styles.actions, { paddingBottom: insets.bottom + 20 }]}>
          <SplashPrimaryButton label="Get Started" onPress={goToSignIn} />
          <View style={styles.actionGap} />
          <SplashSecondaryButton label="Sign In" onPress={goToSignIn} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenPaddingX.auth,
  },
  title: {
    marginTop: 24,
    fontFamily: fontFamily.headingExtrabold,
    fontSize: fontSize['4xl'],
    color: colors.neutral.white,
  },
  tagline: {
    marginTop: 20,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.lg,
    color: colors.neutral.white,
    textAlign: 'center',
    lineHeight: 26,
  },
  subtext: {
    marginTop: 16,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actions: {
    paddingHorizontal: screenPaddingX.auth,
  },
  actionGap: {
    height: 12,
  },
});
