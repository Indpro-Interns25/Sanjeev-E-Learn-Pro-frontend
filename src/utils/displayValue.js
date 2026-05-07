export function toDisplayText(value, fallback = 'N/A') {
  if (value == null) return fallback;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => toDisplayText(item, '')).filter(Boolean);
    return parts.length ? parts.join(', ') : fallback;
  }
  if (typeof value === 'object') {
    return value?.name || value?.title || value?._id || value?.id || fallback;
  }
  return fallback;
}
