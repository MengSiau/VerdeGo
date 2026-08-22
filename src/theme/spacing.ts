// This file contains the spacing values for the app, including spacing units, border radius values, screen padding, and tap target sizes.
// Extracted from the design-system.json

export const radius = {
  full: 9999,
  '3xl': 24,
  '2xl': 16,
  xl: 12,
  lg: 8,
} as const;

// px-5 (20px) is standard; px-6 (24px) is used on auth/simple-form screens (Login, Verify, Report).
export const screenPaddingX = {
  standard: 20,
  auth: 24,
} as const;

// Minimum 44x44px tap targets is a hard WCAG 2.2 AA rule for this app.
export const tapTarget = {
  primaryButtonHeight: 56,
  secondaryButtonHeight: 52,
  inputHeight: 50,
  minimum: 44,
} as const;
