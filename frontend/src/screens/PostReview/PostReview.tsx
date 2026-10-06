import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Stars } from '@/src/components/Stars';
import { useRidesStore } from '@/src/data/RidesStore';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

const REVIEW_TAGS = ['Great driver', 'On time', 'Clean car', 'Safe', 'Friendly', 'Smooth ride'];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function PostReview() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rides, reviews, submitReview } = useRidesStore();
  const ride = rides.find((r) => r.id === id);
  const existing = id ? reviews[id] : undefined;

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [message, setMessage] = useState(existing?.message ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.tags ?? []);

  if (!ride) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ride not found.</Text>
      </View>
    );
  }

  const firstName = ride.driverName.split(' ')[0];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = () => {
    submitReview({ rideId: ride.id, rating, message: message.trim(), tags: selectedTags });
    router.back();
  };

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />

      <LinearGradient colors={gradients.headerHero} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(ride.driverName)}</Text>
        </View>
        <Text style={styles.heroTitle}>Rate your ride</Text>
        <Text style={styles.heroSubtitle}>How was your trip with {firstName}?</Text>
      </LinearGradient>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.starsWrap}>
          <Stars rating={rating} size={44} gap={18} onChange={setRating} />
        </View>

        <Text style={styles.label}>Write a review (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your experience..."
          placeholderTextColor={colors.neutral.gray400}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />

        <Text style={[styles.label, styles.sectionGap]}>Quick tags</Text>
        <View style={styles.tagsWrap}>
          {REVIEW_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tag, active && styles.tagActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton label="Submit Review" onPress={handleSubmit} disabled={rating === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: screenPaddingX.standard,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize['2xl'],
    color: colors.neutral.white,
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  heroSubtitle: {
    marginTop: 4,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  body: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 28,
    paddingBottom: 16,
  },
  starsWrap: {
    alignItems: 'center',
  },
  label: {
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray700,
  },
  sectionGap: {
    marginTop: 24,
  },
  textArea: {
    minHeight: 110,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray900,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.brand.verde200,
    backgroundColor: colors.brand.verde50,
  },
  tagActive: {
    borderColor: colors.brand.verde500,
    backgroundColor: colors.brand.verde500,
  },
  tagText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.brand.verde700,
  },
  tagTextActive: {
    color: colors.neutral.white,
  },
  footer: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 12,
  },
});
