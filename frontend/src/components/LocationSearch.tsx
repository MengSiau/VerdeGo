import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { PlaceSuggestion } from '@/src/hooks/UsePlacesAutocomplete';
import { colors, fontFamily, fontSize, radius } from '@/src/theme';

type LocationSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  suggestions: PlaceSuggestion[];
  loading: boolean;
  error: string | null;
  onSelect: (placeId: string) => void;
  onClear: () => void;
  placeholder?: string;
};

/**
 * Search field with a results list beneath it.
 *
 * Renders nothing below the input until there are results, so it collapses
 * back to a single row and doesn't cover the map while idle.
 */
export function LocationSearch({
  query,
  onQueryChange,
  suggestions,
  loading,
  error,
  onSelect,
  onClear,
  placeholder = 'Search for a pick-up point',
}: LocationSearchProps) {
  const showResults = suggestions.length > 0 || Boolean(error);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color={colors.neutral.gray400} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.gray400}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search for a pick-up location"
        />
        {loading ? <ActivityIndicator size="small" color={colors.neutral.gray400} /> : null}
        {query.length > 0 && !loading ? (
          <Pressable onPress={onClear} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.neutral.gray400} />
          </Pressable>
        ) : null}
      </View>

      {showResults ? (
        <View style={styles.results}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            suggestions.map((suggestion, index) => (
              <Pressable
                key={suggestion.placeId}
                onPress={() => onSelect(suggestion.placeId)}
                accessibilityRole="button"
                style={[styles.row, index === suggestions.length - 1 && styles.rowLast]}>
                <View style={styles.rowIcon}>
                  <Ionicons name="location" size={14} color={colors.brand.verde600} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.primaryText} numberOfLines={1}>
                    {suggestion.primaryText}
                  </Text>
                  {suggestion.secondaryText ? (
                    <Text style={styles.secondaryText} numberOfLines={1}>
                      {suggestion.secondaryText}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius['2xl'],
    shadowColor: colors.neutral.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.base,
    color: colors.neutral.gray900,
  },
  results: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray100,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray100,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.verde50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  primaryText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    color: colors.neutral.gray800,
  },
  secondaryText: {
    marginTop: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
  errorText: {
    paddingVertical: 14,
    fontFamily: fontFamily.bodyRegular,
    fontSize: fontSize.sm,
    color: colors.neutral.gray500,
  },
});
