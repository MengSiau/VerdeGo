import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

type StarsProps = {
  rating: number;
  size?: number;
  /** When provided, each star is tappable and reports the chosen rating (1-5). */
  onChange?: (rating: number) => void;
  gap?: number;
};

// 1-5 star rating. Filled star = accent, empty star = outline in the border colour.
// Tappable (for picking a rating) when onChange is given, otherwise a read-only display.
export function Stars({ rating, size = 14, onChange, gap = 2 }: StarsProps) {
  const { colors } = useTheme();
  const filled = Math.round(rating);

  return (
    <View
      style={[styles.row, { gap }]}
      accessible={!onChange}
      accessibilityLabel={onChange ? undefined : `Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const star = (
          <Ionicons
            name={index < filled ? "star" : "star-outline"}
            size={size}
            color={index < filled ? colors.accent : colors.border}
          />
        );
        if (!onChange) return <View key={index}>{star}</View>;
        return (
          <Pressable
            key={index}
            onPress={() => onChange(index + 1)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${index + 1} out of 5`}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});
