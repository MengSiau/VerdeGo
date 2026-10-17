import { Switch } from "react-native";
import { useTheme } from "@/src/theme/useTheme";

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label: string;
};

export function ThemedSwitch({ value, onValueChange, label }: Props) {
  const { colors } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      trackColor={{ false: colors.border, true: colors.brand }}
      thumbColor={colors.onBrand}
      ios_backgroundColor={colors.border}
    />
  );
}