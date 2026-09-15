import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AccountRow } from "@/src/components/AccountRow";
import { BottomNav } from "@/src/components/BottomNav";
import { SegmentedOptions } from "@/src/components/SegmentedOptions";
import { useUserDetailStore } from "@/src/data/UserDetailStore";
import {
    colors,
    fontFamily,
    fontSize,
    gradients,
    radius,
    screenPaddingX,
} from "@/src/theme";

export function Profile() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    togglePushNotifications,
    setTextSize,
    toggleHighContrastMode,
  } = useUserDetailStore();

  //default to 'your name' if strings are empty
  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || "Your Name";

  // Same "first + last initial" derivation ProfileSetup uses for its avatar preview.
  const initials = useMemo(() => {
    const first = profile.firstName.trim().charAt(0);
    const last = profile.lastName.trim().charAt(0);
    return (first + last).toUpperCase() || "?";
  }, [profile.firstName, profile.lastName]);

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />

      <LinearGradient
        colors={gradients.headerHero}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.identityRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            {profile.monashVerified && (
              <View style={styles.avatarStatusDot}>
                <Ionicons
                  name="checkmark"
                  size={11}
                  color={colors.neutral.white}
                />
              </View>
            )}
          </View>

          <View style={styles.identityText}>
            <Text style={styles.name}>{fullName}</Text>
            <View style={styles.subRow}>
              <Text style={styles.subText}>Student</Text>
              {profile.monashVerified && (
                <>
                  <Text style={styles.subDot}>·</Text>
                  <Text style={styles.subText}>Monash Verified</Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={colors.neutral.white}
                  />
                </>
              )}
            </View>
            <View style={styles.statsRow}>
              <Ionicons name="star" size={13} color={colors.accent.amber400} />
              <Text style={styles.statsText}>
                {profile.rating.toFixed(1)} · {profile.totalRides} rides ·{" "}
                {profile.greenGrade} Green Driver
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
            <AccountRow icon="person-outline" label="Personal Info" />
            <Divider />
            <AccountRow icon="car-outline" label="Vehicle Details" />
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
                  color={colors.accent.amber500}
                />
              </View>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Switch
                value={profile.notificationEnabled}
                onValueChange={togglePushNotifications}
                trackColor={{
                  false: colors.neutral.gray200,
                  true: colors.brand.verde500,
                }}
                thumbColor={colors.neutral.white}
                ios_backgroundColor={colors.neutral.gray200}
              />
            </View>
          </Card>
        </Section>

        <Section title="Accessibility" badge="WCAG 2.2 AA">
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

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>High Contrast Mode</Text>
              <Switch
                value={profile.contrast}
                onValueChange={toggleHighContrastMode}
                trackColor={{
                  false: colors.neutral.gray200,
                  true: colors.brand.verde500,
                }}
                thumbColor={colors.neutral.white}
                ios_backgroundColor={colors.neutral.gray200}
              />
            </View>

            <Text style={styles.footnote}>
              All tap targets are ≥44×44px · Minimum 4.5:1 text
            </Text>
          </Card>
        </Section>
      </ScrollView>

      <BottomNav active="profile" />
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
  return <View style={styles.card}>{children}</View>;
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
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
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize["2xl"],
    color: colors.brand.verde700,
  },
  avatarStatusDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde500,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.brand.verde700,
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.85)",
  },
  subDot: {
    color: "rgba(255,255,255,0.6)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statsText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.85)",
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
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    color: colors.neutral.gray500,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.brand.verde100,
  },
  badgePillText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize["2xs"],
    color: colors.brand.verde700,
  },
  card: {
    borderRadius: radius["2xl"],
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral.gray100,
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
    fontSize: fontSize.base,
    color: colors.neutral.gray800,
  },
  fieldLabel: {
    marginTop: 12,
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  fieldSpacing: {
    marginTop: 10,
    marginBottom: 4,
  },
  footnote: {
    marginTop: 12,
    marginBottom: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize["2xs"],
    color: colors.neutral.gray400,
  },
});
