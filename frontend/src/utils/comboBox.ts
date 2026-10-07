export const COMBOBOX_MAX_ROWS = 300;

export function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/[\s-]+/g, '');
}

export function filterOptions<T extends { label: string }>(options: T[], query: string): T[] {
  const search = normalizeSearch(query);
  return options.filter((option) => normalizeSearch(option.label).includes(search)).slice(0, COMBOBOX_MAX_ROWS);
}
