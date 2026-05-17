type HashtagCount = { tag: string; count: number }

let cachedHashtags: HashtagCount[] = []

export function getTrendingHashtagsCache(): HashtagCount[] {
  return cachedHashtags
}

export function setTrendingHashtagsCache(hashtags: HashtagCount[]): void {
  cachedHashtags = hashtags
}
