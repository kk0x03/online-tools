export function formatJson(text) {
  try {
    const obj = JSON.parse(text)
    return { text: JSON.stringify(obj, null, 2), error: null }
  } catch (e) {
    return { text: null, error: e.message }
  }
}

export function minifyJson(text) {
  try {
    const obj = JSON.parse(text)
    return { text: JSON.stringify(obj), error: null }
  } catch (e) {
    return { text: null, error: e.message }
  }
}
