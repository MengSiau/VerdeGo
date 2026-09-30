import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalloutBanner } from '@/src/components/CalloutBanner';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { StatusIcon } from '@/src/components/StatusIcon';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

export function VerifyEmail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email, status } = useLocalSearchParams<{ email?: string; status?: string }>();
  const isSuccess = status === 'success';

  return (
    <View style={styles.fill}>
      <StatusBar style="dark" />
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color={colors.neutral.gray900} />
          </Pressable>
          <Text style={styles.headerTitle}>Verify Email</Text>
        </View>

        <View style={styles.body}>
          <StatusIcon variant={isSuccess ? 'success' : 'danger'} />

          <Text style={styles.title}>{isSuccess ? 'Email Verified!' : 'Invalid Email Domain'}</Text>
          <Text style={styles.subtitle}>
            {isSuccess
              ? "Your Monash email has been verified. You're almost ready to go!"
              : 'VerdeGo is exclusive to Monash University. Please use your @student.monash.edu or @monash.edu address.'}
          </Text>

          <View style={styles.bannerWrap}>
            {isSuccess ? (
              <CalloutBanner
                variant="info"
                heading={email ?? ''}
                body="Monash University — Student"
                icon={
                  <View style={styles.badgeIcon}>
                    <Ionicons name="checkmark" size={20} color={colors.neutral.white} />
                  </View>
                }
              />
            ) : (
              <CalloutBanner
                variant="danger"
                heading="Accepted domains only:"
                body={'@student.monash.edu\n@monash.edu'}
                icon={<View style={styles.dot} />}
              />
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {isSuccess ? (
            <PrimaryButton
              label="Set Up Profile"
              onPress={() => router.push({ pathname: '/profile-setup', params: { email } })}
            />
          ) : (
            <SecondaryButton label="Try Again" onPress={() => router.back()} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenPaddingX.auth,
  },
  header: {
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
  headerTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
  },
  body: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    marginTop: 24,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.gray900,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  bannerWrap: {
    marginTop: 24,
    width: '100%',
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.verde600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.semantic.danger,
    marginTop: 6,
  },
  actions: {
    marginTop: 32,
  },
});
