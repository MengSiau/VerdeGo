import { useMemo } from "react";
import { useTheme, type Theme } from "@/src/theme/useTheme";

export function useThemedStyles<T>(factory: (t: Theme) => T) {
  const theme = useTheme();
  const styles = useMemo(() => factory(theme), [theme]);
  return { styles, theme };
}