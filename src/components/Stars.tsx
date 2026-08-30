import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';

type StarsProps = {
  rating: number;
  size?: number;
};

// 1-5 star rating display. Filled = amber-500, empty = gray-200.
export function Stars({ rating, size = 14 }: StarsProps) {
  const filled = Math.round(rating);

  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Ionicons
          key={index}
          name={index < filled ? 'star' : 'star-outline'}
          size={size}
          color={index < filled ? colors.accent.amber500 : colors.neutral.gray200}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
