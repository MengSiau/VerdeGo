import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';

type StarsProps = {
  rating: number;
  size?: number;
  /** When provided, each star is tappable and reports the chosen rating (1-5). */
  onChange?: (rating: number) => void;
  gap?: number;
};

// 1-5 star rating. Filled = amber-500, empty = gray-200.
export function Stars({ rating, size = 14, onChange, gap = 2 }: StarsProps) {
  const filled = Math.round(rating);

  return (
    <View style={[styles.row, { gap }]}>
      {Array.from({ length: 5 }).map((_, index) => {
        const star = (
          <Ionicons
            name={index < filled ? 'star' : 'star-outline'}
            size={size}
            color={index < filled ? colors.accent.amber500 : colors.neutral.gray200}
          />
        );
        if (!onChange) return <View key={index}>{star}</View>;
        return (
          <Pressable key={index} onPress={() => onChange(index + 1)} hitSlop={4}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
