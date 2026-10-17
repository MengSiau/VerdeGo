import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { fontFamily, radius, tapTarget } from "@/src/theme";
import type { Theme } from "@/src/theme/useTheme";
import { useThemedStyles } from "@/src/theme/useThemedStyles";

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  const { styles, theme } = useThemedStyles(makeStyles);

  return (
    <View>
      <Text style={styles.label} maxFontSizeMultiplier={1.6}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.muted}
        maxFontSizeMultiplier={1.6}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    label: {
      marginBottom: 8,
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
    },
    input: {
      minHeight: tapTarget.inputHeight,
      borderWidth: 2,
      borderColor: t.colors.border,
      borderRadius: radius.xl,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: t.colors.surface,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      color: t.colors.text,
    },
  });