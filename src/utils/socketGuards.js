export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function isValidRoomId(roomId) {
  return typeof roomId === 'string' && roomId.trim().length > 0;
}

export function isValidChatMessage(payload) {
  if (!isPlainObject(payload)) return false;
  if (!isValidRoomId(payload.roomId)) return false;
  return normalizeText(payload.text).length > 0;
}

export function isValidParticipantsPayload(payload) {
  if (!isPlainObject(payload)) return false;
  if (!isValidRoomId(payload.roomId)) return false;
  return Array.isArray(payload.participants);
}

export function dedupeById(items, max = 50) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
    if (result.length >= max) break;
  }

  return result;
}