import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, fontSize, radius, tapTarget } from '@/src/theme';

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string | null;
  options: string[];
  onChange: (value: string) => void;
};

// Dropdown-style field. React Native has no native <select>, so this opens a
// bottom sheet of options instead - matches the app's documented bottomSheetModal pattern.
export function SelectField({ label, placeholder, value, options, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <Text style={[styles.value, !value && styles.placeholder]}>{value ?? placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.neutral.gray500} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    style={styles.option}>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item}</Text>
                    {selected && <Ionicons name="checkmark" size={20} color={colors.brand.verde600} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
  field: {
    minHeight: tapTarget.inputHeight,
    borderWidth: 2,
    borderColor: colors.neutral.gray200,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray800,
  },
  placeholder: {
    color: colors.neutral.gray400,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '60%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.gray300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: fontSize.lg,
    color: colors.neutral.gray900,
    marginBottom: 12,
  },
  option: {
    minHeight: tapTarget.minimum,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.base,
    color: colors.neutral.gray700,
  },
  optionTextSelected: {
    fontFamily: fontFamily.headingSemibold,
    color: colors.brand.verde700,
  },
});
