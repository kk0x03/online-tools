function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

export function buildApiUrl(path) {
  const baseUrl = trimTrailingSlash(import.meta.env.VITE_API_URL)
  return `${baseUrl}${normalizePath(path)}`
}

export function buildWebSocketUrl(path) {
  const socketPath = normalizePath(path)
  const configuredUrl = trimTrailingSlash(import.meta.env.VITE_WS_URL)
  if (configuredUrl) return `${configuredUrl}${socketPath}`

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}${socketPath}`
}
