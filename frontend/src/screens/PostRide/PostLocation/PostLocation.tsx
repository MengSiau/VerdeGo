import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { colors, fontFamily, fontSize, mapBg, radius, screenPaddingX } from '@/src/theme';

import { usePostRideDraft } from '../PostRideContext';
import { PostRideHeader } from '../PostRideHeader';

const DEFAULT_PICKUP = 'Glen Waverley Station';
const DESTINATION = 'Monash Clayton Campus';

const SUGGESTED_NEARBY = ['Glen Waverley Station', 'Brandon Park Shopping Centre', 'Springvale Station'];

export function PostLocation() {
  const router = useRouter();
  const { draft, updateDraft } = usePostRideDraft();
  const pickup = draft.pickup ?? DEFAULT_PICKUP;

  const handleConfirm = () => {
    updateDraft({ pickup });
    router.push('/post-datetime');
  };

  return (
    <View style={styles.fill}>
      <PostRideHeader title="Post a Ride" step={1} />

      <View style={styles.mapArea}>
        {/* TODO: replace with a real interactive map once a map API is linked up. */}
        <View style={[StyleSheet.absoluteFill, styles.mapPlaceholder]}>
          <View style={styles.pinOuter}>
            <View style={styles.pinInner} />
          </View>
          <View style={styles.pinStem} />
        </View>

        <View style={[styles.floatingCard, styles.departureCard]}>
          <Text style={styles.sectionLabel}>Departure Point</Text>
          <View style={styles.locationRow}>
            <View style={styles.pickupDot} />
            <Text style={styles.pickupText}>{pickup}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.brand.verde600} />
            <Text style={styles.destinationText}>{DESTINATION}</Text>
            <Text style={styles.fixedText}>Fixed</Text>
          </View>
        </View>

        <View style={[styles.floatingCard, styles.suggestedCard]}>
          <Text style={styles.sectionLabel}>Suggested Nearby</Text>
          {SUGGESTED_NEARBY.map((place, index) => (
            <Pressable
              key={place}
              onPress={() => updateDraft({ pickup: place })}
              style={[styles.suggestedRow, index === SUGGESTED_NEARBY.length - 1 && styles.suggestedRowLast]}>
              <View style={styles.suggestedIcon}>
                <Ionicons name="location" size={14} color={colors.brand.verde600} />
              </View>
              <Text style={styles.suggestedText}>{place}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Confirm Location" onPress={handleConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  mapArea: {
    flex: 1,
  },
  floatingCard: {
    position: 'absolute',
    left: screenPaddingX.standard,
    right: screenPaddingX.standard,
    padding: 16,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  departureCard: {
    top: 16,
  },
  sectionLabel: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize['2xs'],
    color: colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
  },
  pickupText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  divider: {
    marginVertical: 10,
    height: 1,
    backgroundColor: colors.neutral.gray100,
  },
  destinationText: {
    flex: 1,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.brand.verde600,
  },
  fixedText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray400,
  },
  mapPlaceholder: {
    backgroundColor: mapBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinOuter: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinInner: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.accent.amber500,
  },
  pinStem: {
    width: 2,
    height: 24,
    backgroundColor: colors.accent.amber500,
  },
  suggestedCard: {
    bottom: 16,
  },
  suggestedRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  suggestedRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  suggestedIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.verde50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: colors.neutral.gray800,
  },
  actions: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.neutral.white,
  },
});
