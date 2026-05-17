const STORAGE_KEY = 'hashtag_history'
const MAX_HISTORY = 10

export function getHashtagHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.slice(0, MAX_HISTORY)
    return []
  } catch {
    return []
  }
}

export function addHashtagsToHistory(hashtags: string[]): void {
  if (!hashtags.length) return

  const current = getHashtagHistory()
  const normalized = hashtags.map((t) => t.toLowerCase())

  const merged: string[] = []
  const seen = new Set<string>()
  for (const tag of [...normalized, ...current]) {
    if (!seen.has(tag)) {
      seen.add(tag)
      merged.push(tag)
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, MAX_HISTORY)))
}
