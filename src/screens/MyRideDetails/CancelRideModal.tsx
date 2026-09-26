import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SecondaryButton } from '@/src/components/SecondaryButton';
import type { Ride } from '@/src/data/rides';
import { colors, fontFamily, fontSize, radius, screenPaddingX } from '@/src/theme';

type CancelRideModalProps = {
  visible: boolean;
  ride: Ride;
  onKeep: () => void;
  onConfirmCancel: () => void;
};

// Confirmation bottom sheet shown from MyRideDetails - design-system.json's
// "bottomSheetModal" component, documented usage: "CancelModalScreen confirmation sheet".
export function CancelRideModal({ visible, ride, onKeep, onConfirmCancel }: CancelRideModalProps) {
  const insets = useSafeAreaInsets();
  const shortPickup = ride.pickup.replace(/ Station$/, '');
  const driverFirstName = ride.driverName.split(' ')[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onKeep}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onKeep} accessibilityLabel="Dismiss" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.dragHandle} />
          <Text style={styles.title}>Cancel this ride?</Text>
          <Text style={styles.body}>
            Cancelling{' '}
            <Text style={styles.bold}>
              {shortPickup} → Monash, {ride.departureTime}
            </Text>{' '}
            may affect {driverFirstName} and other passengers. Your reliability score may be impacted.
          </Text>

          <View style={styles.actions}>
            <SecondaryButton variant="destructive" label="Yes, Cancel Ride" onPress={onConfirmCancel} />
            <View style={styles.actionGap} />
            <PrimaryButton label="Keep My Ride" onPress={onKeep} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    backgroundColor: colors.neutral.white,
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 12,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray300,
    marginBottom: 20,
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.lg,
    color: colors.neutral.gray900,
  },
  body: {
    marginTop: 12,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
    lineHeight: 20,
  },
  bold: {
    fontFamily: fontFamily.bodySemibold,
    color: colors.neutral.gray700,
  },
  actions: {
    marginTop: 24,
  },
  actionGap: {
    height: 12,
  },
});
