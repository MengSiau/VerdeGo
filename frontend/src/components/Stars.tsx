import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/src/theme/useTheme";

type StarsProps = {
  rating: number;
  size?: number;
};

// 1-5 star rating display. Filled star = accent, empty star = outline in the border colour.
export function Stars({ rating, size = 14 }: StarsProps) {
  const { colors } = useTheme();
  const filled = Math.round(rating);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Ionicons
          key={index}
          name={index < filled ? "star" : "star-outline"}
          size={size}
          color={index < filled ? colors.accent : colors.border}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 2,
  },
});