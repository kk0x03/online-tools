export function parseJsonSafe(text) {
  try {
    if (!text || !text.trim()) return { data: null, error: null }
    return { data: JSON.parse(text), error: null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}
