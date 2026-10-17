import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { SecondaryButton } from "@/src/components/SecondaryButton";
import type { Ride } from "@/src/data/rides";
import { fontFamily, radius, screenPaddingX } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type CancelRideModalProps = {
  visible: boolean;
  ride: Ride;
  onKeep: () => void;
  onConfirmCancel: () => void;
  /** True while the cancellation request is in flight - disables both buttons. */
  confirming?: boolean;
};

// Confirmation bottom sheet shown from MyRideDetails - design-system.json's
// "bottomSheetModal" component, documented usage: "CancelModalScreen confirmation sheet".
export function CancelRideModal({ visible, ride, onKeep, onConfirmCancel, confirming = false }: CancelRideModalProps) {
  const insets = useSafeAreaInsets();
  const { styles } = useThemedStyles(makeStyles);
  const shortPickup = ride.pickup.replace(/ Station$/, "");
  const driverFirstName = ride.driverName.split(" ")[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onKeep}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onKeep}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          accessibilityViewIsModal
        >
          <View style={styles.dragHandle} />
          <Text style={styles.title}>Cancel this ride?</Text>
          <Text style={styles.body}>
            Cancelling{" "}
            <Text style={styles.bold}>
              {shortPickup} → Monash, {ride.departureTime}
            </Text>{" "}
            may affect {driverFirstName} and other passengers. Your reliability score may be
            impacted.
          </Text>

          <View style={styles.actions}>
            <SecondaryButton
              variant="destructive"
              label={confirming ? "Cancelling..." : "Yes, Cancel Ride"}
              disabled={confirming}
              onPress={onConfirmCancel}
            />
            <View style={styles.actionGap} />
            <PrimaryButton label="Keep My Ride" disabled={confirming} onPress={onKeep} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
      borderTopLeftRadius: radius["3xl"],
      borderTopRightRadius: radius["3xl"],
      backgroundColor: t.colors.surface,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: t.colors.divider,
      paddingHorizontal: screenPaddingX.standard,
      paddingTop: 12,
    },
    dragHandle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: t.colors.border,
      marginBottom: 20,
    },
    title: {
      fontFamily: fontFamily.headingBold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
    },
    body: {
      marginTop: 12,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
    bold: {
      fontFamily: fontFamily.bodySemibold,
      color: t.colors.text,
    },
    actions: {
      marginTop: 24,
    },
    actionGap: {
      height: 12,
    },
  });
