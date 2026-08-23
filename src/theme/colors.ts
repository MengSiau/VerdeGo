// This file contains the color palette for the app, including brand colors, accent colors, neutral colors, and semantic colors. 
// Extracted from the design-system.json

export const colors = {
  brand: {
    verde50: '#f0fdf4',
    verde100: '#dcfce7',
    verde200: '#bbf7d0',
    verde300: '#86efac',
    verde400: '#4ade80',
    verde500: '#22c55e',
    verde600: '#16a34a',
    verde700: '#15803d',
  },
  accent: {
    amber400: '#fbbf24',
    amber500: '#f59e0b',
  },
  neutral: {
    charcoal: '#111827',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    white: '#ffffff',
  },
  semantic: {
    success: '#16a34a',
    danger: '#ef4444',
    dangerLight: '#f87171',
    warning: '#f59e0b',
    info: '#22c55e',
  },
} as const;

// Each user avatar is assigned one bg+text pair from this list (Tailwind 100/700 pairs).
export const avatarPalettes = [
  { bg: '#f3e8ff', text: '#7e22ce' }, // purple
  { bg: '#dbeafe', text: '#1d4ed8' }, // blue
  { bg: '#fce7f3', text: '#be185d' }, // pink
  { bg: '#ffedd5', text: '#c2410c' }, // orange
  { bg: '#ccfbf1', text: '#0f766e' }, // teal
  { bg: '#ffe4e6', text: '#be123c' }, // rose
  { bg: '#e0e7ff', text: '#4338ca' }, // indigo
  { bg: colors.brand.verde100, text: colors.brand.verde700 }, // green
] as const;

// Gradient color stops, for use with expo-linear-gradient's `colors` prop.
export const gradients = {
  primaryCTA: [colors.brand.verde600, colors.brand.verde500] as const,
  headerHero: [colors.brand.verde700, colors.brand.verde500] as const,
  splash: [colors.brand.verde700, colors.brand.verde500, colors.brand.verde300] as const,
  splashLocations: [0, 0.5, 1] as const,
  postFabButton: [colors.brand.verde500, colors.brand.verde300] as const,
  destructive: [colors.semantic.danger, colors.semantic.dangerLight] as const,
};
