import { toNoteList } from '@/lib/link'
import { getDefaultRelayUrls } from '@/lib/relay'
import { useSecondaryPage } from '@/PageManager'
import client from '@/services/client.service'
import { Hash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../ui/skeleton'

type HashtagCount = { tag: string; count: number }

const CACHE_TTL = 5 * 60 * 1000
const cache = new Map<string, { hashtags: HashtagCount[]; cachedAt: number }>()

export default function RelatedHashtags({ hashtag }: { hashtag: string }) {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const normalized = hashtag.toLowerCase()
  const cached = cache.get(normalized)
  const [hashtags, setHashtags] = useState<HashtagCount[] | null>(
    cached && Date.now() - cached.cachedAt <= CACHE_TTL ? cached.hashtags : null
  )
  const [loading, setLoading] = useState(
    !cached || Date.now() - cached.cachedAt > CACHE_TTL
  )

  useEffect(() => {
    const cached = cache.get(normalized)
    if (cached && Date.now() - cached.cachedAt <= CACHE_TTL) {
      setHashtags(cached.hashtags)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchRelatedHashtags() {
      try {
        const events = await client.fetchEvents(getDefaultRelayUrls(), {
          '#t': [normalized],
          limit: 100
        })
        const counts = new Map<string, number>()

        for (const event of events) {
          const seen = new Set<string>()
          for (const tag of event.tags) {
            if (tag[0] === 't' && tag[1]) {
              const t = tag[1].toLowerCase()
              if (t !== normalized && !seen.has(t)) {
                seen.add(t)
                counts.set(t, (counts.get(t) ?? 0) + 1)
              }
            }
          }
        }

        const sorted = Array.from(counts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)

        if (!cancelled) {
          cache.set(normalized, { hashtags: sorted, cachedAt: Date.now() })
          setHashtags(sorted)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRelatedHashtags()
    return () => {
      cancelled = true
    }
  }, [normalized])

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Hash className="h-4 w-4" />
          {t('Related')}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
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
        <Hash className="h-4 w-4" />
        {t('Related')}
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
