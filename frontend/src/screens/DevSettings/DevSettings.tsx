import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/src/auth/supabase';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

// Seeded test account - password set via the Supabase admin API for this purpose.
// Dev-only convenience, same spirit as the admin1@student.monash.edu test login.
const TEST_USER_2_EMAIL = 'test.user2@example.com';
const TEST_USER_2_PASSWORD = 'admin2';

export function DevSettings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const handleSwitchToTestUser2 = async () => {
    setSwitching(true);
    try {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: TEST_USER_2_EMAIL,
        password: TEST_USER_2_PASSWORD,
      });
      if (error) throw new Error(error.message);
      router.replace('/home');
    } catch (e) {
      Alert.alert('Unable to switch account', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSwitching(false);
    }
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
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Dev Settings</Text>
            <Text style={styles.headerSubtitle}>Testing tools - not for end users</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="swap-horizontal-outline" size={20} color={colors.brand.verde600} />
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>Sign In as Test User 2</Text>
              <Text style={styles.cardBody}>
                Signs you out of your current account and straight into the Test User 2 test
                account, for quickly checking how things look from another account. Sign out and
                log back into your own account manually when you're done.
              </Text>
            </View>
          </View>
          <View style={styles.cardAction}>
            <SecondaryButton
              label={switching ? 'Switching...' : 'Sign In as Test User 2'}
              disabled={switching}
              onPress={handleSwitchToTestUser2}
            />
          </View>
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
  header: {
    paddingHorizontal: screenPaddingX.standard,
    paddingBottom: 20,
  },
  headerRow: {
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
  headerTextGroup: {
    flex: 1,
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
  body: {
    flex: 1,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 20,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    color: colors.neutral.gray500,
  },
  card: {
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    padding: 16,
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    lineHeight: 20,
  },
  cardAction: {
    alignSelf: 'stretch',
  },
});
