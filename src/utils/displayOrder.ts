type OrderedItem = {
  order?: number | null
  createdAt?: string
}

function isNumbered(item: OrderedItem) {
  const order = Number(item.order)
  return Number.isFinite(order) && order > 0
}

function byCreatedAt(a: OrderedItem, b: OrderedItem) {
  return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
}

export function sortByDisplayOrder<T extends OrderedItem>(items: T[]): T[] {
  const numbered = items.filter(isNumbered).sort((a, b) => {
    const diff = Number(a.order) - Number(b.order)
    if (diff !== 0) return diff
    return byCreatedAt(a, b)
  })
  const unnumbered = items.filter((item) => !isNumbered(item)).sort(byCreatedAt)
  const result: Array<T | undefined> = []

  for (const item of numbered) {
    let slot = Math.max(0, Number(item.order) - 1)
    while (result[slot] != null) slot += 1
    result[slot] = item
  }

  let cursor = 0
  for (const item of unnumbered) {
    while (result[cursor] != null) cursor += 1
    result[cursor] = item
    cursor += 1
  }

  return result.filter((item): item is T => item != null)
}
