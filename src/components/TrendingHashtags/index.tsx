import { TRENDING_NOTES_RELAY_URLS } from '@/constants'
import { toNoteList } from '@/lib/link'
import { useSecondaryPage } from '@/PageManager'
import client from '@/services/client.service'
import { TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/skeleton'

type HashtagCount = { tag: string; count: number }

const CACHE_TTL = 5 * 60 * 1000
let cachedHashtags: HashtagCount[] | null = null
let cachedAt = 0

export default function TrendingHashtags() {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const [hashtags, setHashtags] = useState<HashtagCount[] | null>(cachedHashtags)
  const [loading, setLoading] = useState(!cachedHashtags || Date.now() - cachedAt > CACHE_TTL)

  useEffect(() => {
    if (cachedHashtags && Date.now() - cachedAt <= CACHE_TTL) {
      setHashtags(cachedHashtags)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchTrendingHashtags() {
      try {
        const events = await client.fetchEvents(TRENDING_NOTES_RELAY_URLS, { limit: 150 })
        const counts = new Map<string, number>()

        for (const event of events) {
          const seen = new Set<string>()
          for (const tag of event.tags) {
            if (tag[0] === 't' && tag[1]) {
              const normalized = tag[1].toLowerCase()
              if (!seen.has(normalized)) {
                seen.add(normalized)
                counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
              }
            }
          }
        }

        const sorted = Array.from(counts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20)

        if (!cancelled) {
          cachedHashtags = sorted
          cachedAt = Date.now()
          setHashtags(sorted)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTrendingHashtags()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          {t('Trending Topics')}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!hashtags || hashtags.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        {t('Trending Topics')}
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map(({ tag, count }) => (
          <div
            key={tag}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => push(toNoteList({ hashtag: tag }))}
          >
            <span>#{tag}</span>
            <span className="text-xs opacity-60">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
