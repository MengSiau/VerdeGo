import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/src/components/Avatar';
import { Stars } from '@/src/components/Stars';
import { DUMMY_RECEIVED_REVIEWS, type ReceivedReview } from '@/src/data/reviews';
import { colors, fontFamily, fontSize, gradients, radius, screenPaddingX } from '@/src/theme';

// Messages longer than this start collapsed behind a "Read more" toggle.
const COLLAPSE_AFTER_CHARS = 140;

export function Reviews() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { average, count } = useMemo(() => {
    const total = DUMMY_RECEIVED_REVIEWS.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: DUMMY_RECEIVED_REVIEWS.length ? total / DUMMY_RECEIVED_REVIEWS.length : 0,
      count: DUMMY_RECEIVED_REVIEWS.length,
    };
  }, []);

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
          <Text style={styles.headerTitle}>Reviews</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.averageText}>{average.toFixed(1)}</Text>
          <View style={styles.summaryText}>
            <Stars rating={average} size={16} />
            <Text style={styles.summarySubtext}>
              {count} review{count === 1 ? '' : 's'} from riders
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {DUMMY_RECEIVED_REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ScrollView>
    </View>
  );
}

function ReviewCard({ review }: { review: ReceivedReview }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.message.length > COLLAPSE_AFTER_CHARS;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar name={review.reviewerName} size={40} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.reviewerName}</Text>
          <Text style={styles.timeAgo}>{review.timeAgo}</Text>
        </View>
      </View>

      <View style={styles.starsRow}>
        <Stars rating={review.rating} size={14} />
      </View>

      <Text style={styles.message} numberOfLines={isLong && !expanded ? 3 : undefined}>
        {review.message}
      </Text>

      {isLong && (
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less' : 'Read more'}
          style={styles.toggle}>
          <Text style={styles.toggleText}>{expanded ? 'Show less' : 'Read more'}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={colors.brand.verde700}
          />
        </Pressable>
      )}
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
    paddingBottom: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.headingBold,
    fontSize: fontSize.xl,
    color: colors.neutral.white,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  averageText: {
    fontFamily: fontFamily.headingExtrabold,
    fontSize: fontSize['4xl'],
    color: colors.neutral.white,
  },
  summaryText: {
    gap: 4,
  },
  summarySubtext: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  list: {
    paddingHorizontal: screenPaddingX.standard,
    paddingTop: 16,
    gap: 12,
  },
  card: {
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.neutral.gray100,
    backgroundColor: colors.neutral.white,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewerInfo: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  timeAgo: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.xs,
    color: colors.neutral.gray500,
  },
  starsRow: {
    marginTop: 12,
  },
  message: {
    marginTop: 8,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.neutral.gray700,
  },
  toggle: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    minHeight: 32,
  },
  toggleText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.brand.verde700,
  },
});
