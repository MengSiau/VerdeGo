import { useMemo } from "react";
import { useUserDetailStore } from "@/src/data/UserDetailStore";
import { fontSize as baseFontSize } from "@/src/theme";
import { palettes, type PaletteKey } from "@/src/theme/palettes";

export function useTheme() {
  const { profile } = useUserDetailStore();
  const isDark = profile.themeMode === "dark";
  const scale = profile.prefTextSize === "large" ? 1.3 : 1;
  const key: PaletteKey = profile.contrast
    ? isDark ? "hcDark" : "hcLight"
    : profile.themeMode;

  return useMemo(
    () => ({
      colors: palettes[key],
      isDark,
      fontSize: Object.fromEntries(
        Object.entries(baseFontSize).map(([k, v]) => [k, Math.round(v * scale)]),
      ) as Record<keyof typeof baseFontSize, number>,
      lineHeight: (size: number) => Math.round(size * 1.4),
    }),
    [key, isDark, scale],
  );
}

export type Theme = ReturnType<typeof useTheme>;