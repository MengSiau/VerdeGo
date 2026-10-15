import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AccountRow } from "@/src/components/AccountRow";
import { BottomNav } from "@/src/components/BottomNav";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { SecondaryButton } from "@/src/components/SecondaryButton";
import { SegmentedOptions } from "@/src/components/SegmentedOptions";
import { TextField } from "@/src/components/TextField";
import { ThemedSwitch } from "@/src/components/ThemedSwitch";
import { useUserDetailStore } from "@/src/data/UserDetailStore";
import { colors, fontFamily, radius, screenPaddingX } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

export function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles, theme } = useThemedStyles(makeStyles);
  const {
    profile,
    togglePushNotifications,
    setTextSize,
    toggleHighContrastMode,
    setThemeMode,
    updateProfile,
  } = useUserDetailStore();

  // default to 'your name' if strings are empty
  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || "Your Name";

  // Same "first + last initial" derivation ProfileSetup uses for its avatar preview.
  const initials = useMemo(() => {
    const first = profile.firstName.trim().charAt(0);
    const last = profile.lastName.trim().charAt(0);
    return (first + last).toUpperCase() || "?";
  }, [profile.firstName, profile.lastName]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftPreferredName, setDraftPreferredName] = useState(
    profile.preferredName,
  );

  const openEditName = () => {
    setDraftPreferredName(profile.preferredName); // reset draft to current saved value
    setIsEditingName(true);
  };

  const savePreferredName = () => {
    updateProfile({ preferredName: draftPreferredName.trim() });
    setIsEditingName(false);
  };

  const handleSignOut = () => {
    router.replace("/");
  };

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[...theme.colors.headerGradient]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.identityRow}>
          <View
            style={styles.avatarWrap}
            accessible
            accessibilityLabel={`Profile picture for ${fullName}`}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.avatarStatusDot}>
              <Ionicons name="checkmark" size={11} color={theme.colors.onBrand} />
            </View>
          </View>

          <View style={styles.identityText}>
            <Text style={styles.name}>{fullName}</Text>

            {profile.preferredName.trim() !== "" && (
              <Text style={styles.preferredNameText}>
                PREFERRED NAME: {profile.preferredName}
              </Text>
            )}

            <View style={styles.subRow}>
              <Text style={styles.subText}>Student</Text>
              <Text style={styles.subDot}>·</Text>
              <Text style={styles.subText}>Monash Verified</Text>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={theme.colors.onHeader}
              />
            </View>

            <View style={styles.statsRow}>
              <Ionicons name="star" size={13} color={colors.accent.amber400} />
              <Text style={styles.statsText}>
                {profile.rating.toFixed(1)} · {profile.totalRides} rides ·{" "}
                {profile.userGreenScore} Green Driver
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Account">
          <Card>
            <AccountRow
              icon="person-outline"
              label="Personal Info"
              onPress={openEditName}
            />
            <Divider />
            <AccountRow
              icon="car-outline"
              label="Vehicle Details"
              onPress={() => router.push("/my-vehicles")}
            />
            <Divider />
            <AccountRow icon="card-outline" label="Payment Method" />
            <Divider />
            <AccountRow icon="school-outline" label="Monash ID Verification" />
          </Card>
        </Section>

        <Section title="Notifications">
          <Card>
            <View style={styles.switchRow}>
              <View style={styles.switchIconWrap}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={theme.colors.brand}
                />
              </View>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <ThemedSwitch
                label="Push notifications"
                value={profile.notificationEnabled}
                onValueChange={togglePushNotifications}
              />
            </View>
          </Card>
        </Section>

        <Section title="Accessibility">
          <Card>
            <Text style={styles.fieldLabel}>Text Size</Text>
            <View style={styles.fieldSpacing}>
              <SegmentedOptions
                options={[
                  { label: "Aa Normal", value: "normal" },
                  { label: "Aa Large", value: "large" },
                ]}
                value={profile.prefTextSize}
                onChange={setTextSize}
              />
            </View>

            <Divider />
            <View style={styles.switchRow}>
              <View style={styles.switchIconWrap}>
                <Ionicons
                  name={profile.themeMode === "dark" ? "moon" : "moon-outline"}
                  size={20}
                  color={theme.colors.brand}
                />
              </View>
              <Text style={styles.switchLabel}>Night Mode</Text>
              <ThemedSwitch
                label="Night mode"
                value={profile.themeMode === "dark"}
                onValueChange={(on) => setThemeMode(on ? "dark" : "light")}
              />
            </View>

            <Divider />
            <View style={styles.switchRow}>
              <View style={styles.switchIconWrap}>
                <Ionicons
                  name="contrast-outline"
                  size={20}
                  color={theme.colors.brand}
                />
              </View>
              <Text style={styles.switchLabel}>High Contrast Mode</Text>
              <ThemedSwitch
                label="High contrast mode"
                value={profile.contrast}
                onValueChange={toggleHighContrastMode}
              />
            </View>
          </Card>
        </Section>

        <Pressable
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
        >
          <Text style={styles.signOutLabel}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      <BottomNav active="profile" />

      <Modal
        visible={isEditingName}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingName(false)}
      >
        <View style={styles.modalBackdrop} accessibilityViewIsModal>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Preferred Name</Text>
            <Text style={styles.modalSubtitle}>
              This is what other users will see instead of your sign-up name.
            </Text>
            <TextField
              label="Preferred Name"
              placeholder={fullName}
              value={draftPreferredName}
              onChangeText={setDraftPreferredName}
            />
            <View style={styles.modalActions}>
              <SecondaryButton
                label="Cancel"
                onPress={() => setIsEditingName(false)}
              />
              <PrimaryButton label="Save" onPress={savePreferredName} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  const { styles } = useThemedStyles(makeStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
        {badge && (
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{badge}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const { styles } = useThemedStyles(makeStyles);
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  const { styles } = useThemedStyles(makeStyles);
  return <View style={styles.divider} />;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: {
      flex: 1,
      backgroundColor: t.colors.bg,
    },
    header: {
      paddingHorizontal: screenPaddingX.standard,
      paddingBottom: 24,
    },
    identityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarWrap: {
      width: 68,
      height: 68,
    },
    avatarCircle: {
      width: 68,
      height: 68,
      borderRadius: radius.full,
      backgroundColor: t.colors.onHeader,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitials: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize["2xl"],
      lineHeight: t.lineHeight(t.fontSize["2xl"]),
      color: t.colors.headerGradient[0],
    },
    avatarStatusDot: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 20,
      height: 20,
      borderRadius: radius.full,
      backgroundColor: t.colors.brand,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: t.colors.headerGradient[0],
    },
    identityText: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.xl,
      lineHeight: t.lineHeight(t.fontSize.xl),
      color: t.colors.onHeader,
    },
    preferredNameText: {
      marginTop: 2,
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onHeader,
      letterSpacing: 0.3,
    },
    subRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    subText: {
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.onHeader,
    },
    subDot: {
      color: t.colors.onHeader,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    statsText: {
      flex: 1,
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      color: t.colors.onHeader,
    },
    body: {
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 20,
      gap: 20,
    },
    section: {
      gap: 10,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontFamily: fontFamily.bodySemibold,
      fontSize: t.fontSize.xs,
      lineHeight: t.lineHeight(t.fontSize.xs),
      letterSpacing: 0.5,
      color: t.colors.muted,
    },
    badgePill: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
    },
    badgePillText: {
      fontFamily: fontFamily.bodySemibold,
      fontSize: t.fontSize["2xs"],
      lineHeight: t.lineHeight(t.fontSize["2xs"]),
      color: t.colors.text,
    },
    card: {
      borderRadius: radius["2xl"],
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.divider,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    divider: {
      height: 1,
      backgroundColor: t.colors.divider,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 44,
      paddingVertical: 10,
    },
    switchIconWrap: {
      width: 24,
      alignItems: "center",
    },
    switchLabel: {
      flex: 1,
      fontFamily: fontFamily.bodyMedium,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.text,
    },
    fieldLabel: {
      marginTop: 12,
      fontFamily: fontFamily.bodySemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    fieldSpacing: {
      marginTop: 10,
      marginBottom: 12,
    },
    signOutButton: {
      marginTop: 4,
      minHeight: 48,
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderColor: t.colors.danger,
      backgroundColor: t.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    signOutButtonPressed: {
      opacity: 0.6,
    },
    signOutLabel: {
      fontFamily: fontFamily.bodySemibold,
      fontSize: t.fontSize.base,
      lineHeight: t.lineHeight(t.fontSize.base),
      color: t.colors.danger,
    },
    // semi-transparent layer behind the pop-up
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    // pop-up box
    modalCard: {
      width: "100%",
      borderRadius: radius["2xl"],
      backgroundColor: t.colors.surface,
      padding: 20,
      gap: 12,
    },
    modalTitle: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
    },
    modalSubtitle: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    // cancel/save buttons
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 4,
    },
  });