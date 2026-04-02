import type { Ref } from 'vue';
import type { DatePickerDateSlotOptions } from 'primevue/datepicker'

export const searchForAutocomplete = (
  items: { value: string; code: string }[],
  filteredItems: Ref<{ value: string; code: string }[]>,
  event: { query: string }
) => {
  if (!event?.query?.trim()) {
    filteredItems.value = items;
  } else {
    filteredItems.value = items.filter((item) =>
      item.value.toLowerCase().includes(event.query.toLowerCase())
    );
  }
};

/**
 * parseMDY
 * Parse a string in MM/DD/YYYY or ISO format into a JS Date, or return null.
 * @param {string | null | undefined} s - date string to parse
 * @returns {Date | null} parsed Date object or null if unparsable
 */

export const parseMDY = (s: string | null | undefined): Date | null => {
  if (!s) return null;

  // check if its an ISO Date format
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
  if (isoRegex.test(s)) {
    // Format as MM/DD/YYYY
    const date = new Date(s);
    s = date.toLocaleDateString('en-US');
  }

  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const [mm, dd, yyyy] = parts.map(Number);
  if (!mm || !dd || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (isNaN(d.getTime())) return null;
  return d;
};


/**
 * formatMeta
 * Create a stable string used for `data-test-id` attributes for each date cell.
 * Example output: `dp-2026-01-05`.
 * @param {DatePickerDateSlotOptions} meta - slot metadata provided by PrimeVue
 * @returns {string} formatted id string for the date cell
 */
export function formatMeta(meta: DatePickerDateSlotOptions): string {
  // meta.month is 0–11 in PrimeVue; adjust if needed (it usually is 0-based)
  const y = meta.year
  const m = String(meta.month + 1).padStart(2, '0')
  const d = String(meta.day).padStart(2, '0')
  return `dp-${y}-${m}-${d}`
}