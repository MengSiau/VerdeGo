import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, radius, tapTarget } from '@/src/theme';
import type { Theme } from '@/src/theme/useTheme';
import { useThemedStyles } from '@/src/theme/useThemedStyles';
import { filterOptions } from '@/src/utils/comboBox';

export type ComboBoxOption = { value: string; label: string };
type Props = {
  label: string;
  placeholder: string;
  value: string | null;
  options: ComboBoxOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function ComboBox({ label, placeholder, value, options, disabled = false, onChange }: Props) {
  const { styles, theme } = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);
  return (
    <View>
      <Text style={styles.label} maxFontSizeMultiplier={1.6}>{label}</Text>
      <Pressable disabled={disabled} accessibilityRole="combobox" accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open && !disabled }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onPress={() => { setQuery(''); setOpen(true); }}
        style={[styles.field, disabled && styles.disabled, focused && styles.focused]}>
        <Text maxFontSizeMultiplier={1.6} style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
      </Pressable>
      <Modal visible={open && !disabled} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close options" style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]} accessibilityViewIsModal>
            <Text style={styles.heading} maxFontSizeMultiplier={1.6}>{label}</Text>
            <TextInput autoFocus value={query} onChangeText={setQuery} placeholder={`Search ${label.toLowerCase()}...`}
              accessibilityLabel={`Search ${label.toLowerCase()}`} autoCorrect={false}
              maxFontSizeMultiplier={1.6}
              placeholderTextColor={theme.colors.muted} style={[styles.field, styles.focused, styles.search]} />
            <FlatList style={styles.options} data={filterOptions(options, query)} keyExtractor={(option) => option.value}
              keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.empty}>No matches</Text>}
              renderItem={({ item }) => (
                <Pressable accessibilityRole="button" accessibilityLabel={item.label}
                  accessibilityState={{ selected: item.value === value }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                  onPress={() => { onChange(item.value); setOpen(false); }}>
                  <Text style={styles.value} maxFontSizeMultiplier={1.6}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color={theme.colors.brand} />}
                </Pressable>
              )} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    field: {
      minHeight: tapTarget.inputHeight,
      borderWidth: 2,
      borderColor: t.colors.border,
      backgroundColor: t.colors.surface,
      borderRadius: radius.xl,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    // Disabled controls are exempt from contrast rules; dimming is enough
    disabled: { opacity: 0.5 },
    focused: { borderColor: t.colors.brand },
    value: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.text,
      flexShrink: 1,
    },
    placeholder: { color: t.colors.muted },
    modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: radius['3xl'],
      borderTopRightRadius: radius['3xl'],
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: t.colors.divider,
      paddingHorizontal: 24,
      paddingTop: 20,
      maxHeight: '70%',
    },
    heading: {
      fontFamily: fontFamily.headingSemibold,
      fontSize: t.fontSize.lg,
      lineHeight: t.lineHeight(t.fontSize.lg),
      color: t.colors.text,
      marginBottom: 12,
    },
    search: {
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      color: t.colors.text,
      marginBottom: 12,
    },
    options: { flexShrink: 1 },
    option: {
      minHeight: tapTarget.minimum,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    // pale green tint vanishes in dark mode, so use the page background plus a dim
    pressed: { backgroundColor: t.colors.bg, opacity: 0.7 },
    empty: {
      paddingVertical: 20,
      fontFamily: fontFamily.bodyRegular,
      fontSize: t.fontSize.sm,
      lineHeight: t.lineHeight(t.fontSize.sm),
      color: t.colors.textSecondary,
    },
  });