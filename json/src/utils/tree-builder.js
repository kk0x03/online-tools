export function buildTree(data, key = null, path = '$', depth = 0, lineHint = null) {
  if (data === null) {
    return { key, value: null, type: 'null', path, depth, children: [], lineHint }
  }

  if (Array.isArray(data)) {
    return {
      key,
      type: 'array',
      path,
      depth,
      length: data.length,
      lineHint,
      children: data.map((item, i) =>
        buildTree(item, i, `${path}[${i}]`, depth + 1)
      )
    }
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data)
    return {
      key,
      type: 'object',
      path,
      depth,
      length: entries.length,
      lineHint,
      children: entries.map(([k, v]) =>
        buildTree(v, k, `${path}.${k}`, depth + 1)
      )
    }
  }

  return {
    key,
    value: data,
    type: typeof data,
    path,
    depth,
    children: [],
    lineHint
  }
}

export function countNodes(tree) {
  if (!tree) return 0
  let count = 1
  if (tree.children) {
    for (const child of tree.children) {
      count += countNodes(child)
    }
  }
  return count
}
