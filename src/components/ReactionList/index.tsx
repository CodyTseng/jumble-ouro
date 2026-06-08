import { useSecondaryPage } from '@/PageManager'
import { SPECIAL_TRUST_SCORE_FILTER_ID } from '@/constants'
import { useStuff } from '@/hooks/useStuff'
import { useStuffStatsById } from '@/hooks/useStuffStatsById'
import { toNote } from '@/lib/link'
import { cn } from '@/lib/utils'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useUserTrust } from '@/providers/UserTrustProvider'
import { TEmoji } from '@/types'
import { Event } from 'nostr-tools'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Emoji from '../Emoji'
import { FormattedTimestamp } from '../FormattedTimestamp'
import Nip05 from '../Nip05'
import UserAvatar from '../UserAvatar'
import Username from '../Username'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

const SHOW_COUNT = 20

function getEmojiKey(emoji: string | TEmoji): string {
  return typeof emoji === 'string' ? emoji : emoji.url
}

export default function ReactionList({ stuff }: { stuff: Event | string }) {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { isSmallScreen } = useScreenSize()
  const { getMinTrustScore, meetsMinTrustScore } = useUserTrust()
  const { stuffKey } = useStuff(stuff)
  const noteStats = useStuffStatsById(stuffKey)
  const [filteredLikes, setFilteredLikes] = useState<
    Array<{
      id: string
      eventId: string
      pubkey: string
      emoji: string | TEmoji
      created_at: number
    }>
  >([])
  const [selectedEmojiKey, setSelectedEmojiKey] = useState<string | null>(null)

  useEffect(() => {
    const filterLikes = async () => {
      const likes = noteStats?.likes ?? []
      const filtered: {
        id: string
        eventId: string
        pubkey: string
        created_at: number
        emoji: string | TEmoji
      }[] = []
      const threshold = getMinTrustScore(SPECIAL_TRUST_SCORE_FILTER_ID.INTERACTIONS)
      if (threshold) {
        await Promise.all(
          likes.map(async (like) => {
            if (await meetsMinTrustScore(like.pubkey, threshold)) {
              filtered.push(like)
            }
          })
        )
      } else {
        filtered.push(...likes)
      }
      filtered.sort((a, b) => b.created_at - a.created_at)
      setFilteredLikes(filtered)
    }
    filterLikes()
  }, [noteStats, stuffKey, getMinTrustScore, meetsMinTrustScore])

  const emojiGroups = useMemo(() => {
    const groups = new Map<string, { emoji: string | TEmoji; count: number }>()
    filteredLikes.forEach((like) => {
      const key = getEmojiKey(like.emoji)
      const existing = groups.get(key)
      if (existing) {
        existing.count++
      } else {
        groups.set(key, { emoji: like.emoji, count: 1 })
      }
    })
    return Array.from(groups.entries()).sort((a, b) => b[1].count - a[1].count)
  }, [filteredLikes])

  const displayedLikes = useMemo(() => {
    if (selectedEmojiKey === null) return filteredLikes
    return filteredLikes.filter((like) => getEmojiKey(like.emoji) === selectedEmojiKey)
  }, [filteredLikes, selectedEmojiKey])

  const [showCount, setShowCount] = useState(SHOW_COUNT)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setShowCount(SHOW_COUNT)
  }, [selectedEmojiKey])

  useEffect(() => {
    if (!bottomRef.current || displayedLikes.length <= showCount) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowCount((c) => c + SHOW_COUNT)
      },
      { rootMargin: '10px', threshold: 0.1 }
    )
    obs.observe(bottomRef.current)
    return () => obs.disconnect()
  }, [displayedLikes.length, showCount])

  return (
    <div className="min-h-[80vh]">
      {filteredLikes.length > 0 && emojiGroups.length > 0 && (
        <div className="border-b px-4 py-2">
          <ScrollArea>
            <div className="flex gap-1">
              <button
                className={cn(
                  'flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-sm transition-colors',
                  selectedEmojiKey === null
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setSelectedEmojiKey(null)}
              >
                <span>{t('All')}</span>
                <span>{filteredLikes.length}</span>
              </button>
              {emojiGroups.map(([key, { emoji, count }]) => (
                <button
                  key={key}
                  className={cn(
                    'flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-sm transition-colors',
                    selectedEmojiKey === key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => setSelectedEmojiKey(key)}
                >
                  <Emoji emoji={emoji} classNames={{ img: 'size-4' }} />
                  <span>{count}</span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {displayedLikes.slice(0, showCount).map((like) => (
        <div
          key={like.id}
          className="clickable flex items-center gap-3 border-b px-4 py-3 transition-colors"
          onClick={() => push(toNote(like.eventId))}
        >
          <div className="flex w-6 flex-col items-center">
            <Emoji
              emoji={like.emoji}
              classNames={{
                text: 'text-xl'
              }}
            />
          </div>

          <UserAvatar userId={like.pubkey} size="medium" className="shrink-0" />

          <div className="w-0 flex-1">
            <Username
              userId={like.pubkey}
              className="max-w-fit truncate text-sm font-semibold text-muted-foreground hover:text-foreground"
              skeletonClassName="h-3"
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Nip05 pubkey={like.pubkey} append="·" />
              <FormattedTimestamp
                timestamp={like.created_at}
                className="shrink-0"
                short={isSmallScreen}
              />
            </div>
          </div>
        </div>
      ))}

      <div ref={bottomRef} />

      <div className="mt-2 text-center text-sm text-muted-foreground">
        {displayedLikes.length > 0 ? t('No more reactions') : t('No reactions yet')}
      </div>
    </div>
  )
}
