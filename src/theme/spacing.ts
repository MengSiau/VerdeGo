// This file contains the spacing values for the app, including spacing units, border radius values, screen padding, and tap target sizes.
// Extracted from the design-system.json

export const radius = {
  full: 9999,
  '3xl': 24,
  '2xl': 16,
  xl: 12,
  lg: 8,
} as const;

export const screenPaddingX = 24;

// Minimum 44x44px tap targets is a hard WCAG 2.2 AA rule for this app.
export const tapTarget = {
  primaryButtonHeight: 56,
  secondaryButtonHeight: 52,
  inputHeight: 50,
  minimum: 44,
} as const;
