// This file contains the typography settings for the app, including font families and font sizes.
// Extracted from the design-system.json

// Poppins = headings, button labels, form labels, numeric/stat values, nav/badges/tabs.
// Inter = body copy, descriptions, placeholders, helper text, timestamps.
export const fontFamily = {
  headingMedium: 'Poppins_500Medium',
  headingSemibold: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
  headingExtrabold: 'Poppins_800ExtraBold',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

export const fontSize = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;
