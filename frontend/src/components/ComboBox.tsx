import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable disabled={disabled} accessibilityRole="combobox" accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open && !disabled }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onPress={() => { setQuery(''); setOpen(true); }}
        style={[styles.field, disabled && styles.disabled, focused && styles.focused]}>
        <Text style={[styles.value, !selected && styles.placeholder]}>{selected?.label ?? placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.neutral.gray500} />
      </Pressable>
      <Modal visible={open && !disabled} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable accessibilityLabel="Close options" style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.heading}>{label}</Text>
            <TextInput autoFocus value={query} onChangeText={setQuery} placeholder={`Search ${label.toLowerCase()}...`}
              accessibilityLabel={`Search ${label.toLowerCase()}`} autoCorrect={false}
              placeholderTextColor={colors.neutral.gray400} style={[styles.field, styles.focused, styles.search]} />
            <FlatList style={styles.options} data={filterOptions(options, query)} keyExtractor={(option) => option.value}
              keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" ListEmptyComponent={<Text style={styles.empty}>No matches</Text>}
              renderItem={({ item }) => (
                <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                  onPress={() => { onChange(item.value); setOpen(false); }}>
                  <Text style={styles.value}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color={colors.brand.verde600} />}
                </Pressable>
              )} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 8, fontFamily: fontFamily.headingSemibold, fontSize: fontSize.sm, color: colors.neutral.gray700 },
  field: { minHeight: tapTarget.inputHeight, borderWidth: 2, borderColor: colors.neutral.gray200,
    borderRadius: radius.xl, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disabled: { opacity: 0.5, backgroundColor: colors.neutral.gray50 },
  focused: { borderColor: colors.brand.verde600 },
  value: { fontFamily: fontFamily.bodyRegular, fontSize: fontSize.sm, color: colors.neutral.gray800, flexShrink: 1 },
  placeholder: { color: colors.neutral.gray400 },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.neutral.white, borderTopLeftRadius: radius['3xl'], borderTopRightRadius: radius['3xl'],
    paddingHorizontal: 24, paddingTop: 20, maxHeight: '70%' },
  heading: { fontFamily: fontFamily.headingSemibold, fontSize: fontSize.lg, color: colors.neutral.gray900, marginBottom: 12 },
  search: { fontFamily: fontFamily.bodyRegular, fontSize: fontSize.sm, color: colors.neutral.gray800, marginBottom: 12 },
  options: { flexShrink: 1 },
  option: { minHeight: tapTarget.minimum, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.neutral.gray100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pressed: { backgroundColor: colors.brand.verde50 },
  empty: { paddingVertical: 20, fontFamily: fontFamily.bodyRegular, color: colors.neutral.gray500 },
});
