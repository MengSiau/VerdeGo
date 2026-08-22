import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.neutral.gray400}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.sm,
    color: colors.neutral.gray700,
  },
  input: {
    minHeight: tapTarget.inputHeight,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray800,
  },
});
