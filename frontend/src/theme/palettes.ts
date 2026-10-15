import type { ThemeMode } from "@/src/data/currentUser";

export type Palette = {
  bg: string;
  surface: string;
  text: string;
  textSecondary: string;
  muted: string;
  brand: string;
  onBrand: string;
  danger: string;
  border: string; // controls: inputs, switch tracks, outlined buttons (needs 3:1)
  divider: string; // decorative: card outlines, divider lines
  headerGradient: readonly [string, string];
  onHeader: string;
};

export const palettes = {
  light: {
    bg: "#f9fafb", surface: "#ffffff", text: "#1f2937", textSecondary: "#4b5563", muted: "#6b7280",
    brand: "#15803d", onBrand: "#ffffff", danger: "#b91c1c",
    border: "#6b7280", divider: "#e5e7eb",
    headerGradient: ["#166534", "#15803d"], onHeader: "#ffffff",
  },
  dark: {
    bg: "#111827", surface: "#1f2937", text: "#f3f4f6", textSecondary: "#d1d5db", muted: "#9ca3af",
    brand: "#4ade80", onBrand: "#052e16", danger: "#f87171",
    border: "#9ca3af", divider: "#374151",
    headerGradient: ["#14532d", "#166534"], onHeader: "#ffffff",
  },
  hcLight: {
    bg: "#ffffff", surface: "#ffffff", text: "#000000", textSecondary: "#1f2937", muted: "#374151",
    brand: "#14532d", onBrand: "#ffffff", danger: "#991b1b",
    border: "#000000", divider: "#000000",
    headerGradient: ["#14532d", "#14532d"], onHeader: "#ffffff",
  },
  hcDark: {
    bg: "#000000", surface: "#000000", text: "#ffffff", textSecondary: "#f3f4f6", muted: "#d1d5db",
    brand: "#4ade80", onBrand: "#000000", danger: "#ff8a8a",
    border: "#ffffff", divider: "#ffffff",
    headerGradient: ["#000000", "#000000"], onHeader: "#ffffff",
  },
} satisfies Record<string, Palette>;

export type PaletteKey = keyof typeof palettes;