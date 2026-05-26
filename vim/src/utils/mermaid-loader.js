let mermaidInstance = null
let loadPromise = null

export async function loadMermaid() {
  if (mermaidInstance) return mermaidInstance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const mod = await import('mermaid')
    const mermaid = mod.default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    })
    mermaidInstance = mermaid
    return mermaidInstance
  })()

  return loadPromise
}

export function isLoaded() {
  return mermaidInstance !== null
}
