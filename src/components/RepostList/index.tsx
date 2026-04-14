import { useSecondaryPage } from '@/PageManager'
import { SPECIAL_TRUST_SCORE_FILTER_ID } from '@/constants'
import { useStuffStatsById } from '@/hooks/useStuffStatsById'
import { getEventKey } from '@/lib/event'
import { toProfile } from '@/lib/link'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useUserTrust } from '@/providers/UserTrustProvider'
import { Repeat } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormattedTimestamp } from '../FormattedTimestamp'
import Nip05 from '../Nip05'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

const SHOW_COUNT = 20

export default function RepostList({ event }: { event: Event }) {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { isSmallScreen } = useScreenSize()
  const { getMinTrustScore, meetsMinTrustScore } = useUserTrust()
  const noteStats = useStuffStatsById(getEventKey(event))
  const [filteredReposts, setFilteredReposts] = useState<
    Array<{ id: string; pubkey: string; created_at: number }>
  >([])

  useEffect(() => {
    const filterReposts = async () => {
      const reposts = noteStats?.reposts ?? []
      const trustScoreThreshold = getMinTrustScore(SPECIAL_TRUST_SCORE_FILTER_ID.INTERACTIONS)
      if (!trustScoreThreshold) {
        setFilteredReposts([...reposts].sort((a, b) => b.created_at - a.created_at))
        return
      }
      const filtered = (
        await Promise.all(
          reposts.map(async (repost) => {
            if (await meetsMinTrustScore(repost.pubkey, trustScoreThreshold)) {
              return repost
            }
          })
        )
      ).filter(Boolean) as {
        id: string
        pubkey: string
        created_at: number
      }[]
      filtered.sort((a, b) => b.created_at - a.created_at)
      setFilteredReposts(filtered)
    }
    filterReposts()
  }, [noteStats, event.id, getMinTrustScore, meetsMinTrustScore])

  const [showCount, setShowCount] = useState(SHOW_COUNT)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!bottomRef.current || filteredReposts.length <= showCount) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShowCount((c) => c + SHOW_COUNT)
      },
      { rootMargin: '10px', threshold: 0.1 }
    )
    obs.observe(bottomRef.current)
    return () => obs.disconnect()
  }, [filteredReposts.length, showCount])

  return (
    <div className="min-h-[80vh]">
      {filteredReposts.slice(0, showCount).map((repost) => (
        <div
          key={repost.id}
          className="clickable flex items-center gap-3 border-b px-4 py-3 transition-colors"
          onClick={() => push(toProfile(repost.pubkey))}
        >
          <Repeat className="size-5 text-green-400" />

          <UserAvatar userId={repost.pubkey} size="medium" className="shrink-0" />

          <div className="w-0 flex-1">
            <Username
              userId={repost.pubkey}
              className="max-w-fit truncate text-sm font-semibold text-muted-foreground hover:text-foreground"
              skeletonClassName="h-3"
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Nip05 pubkey={repost.pubkey} append="·" />
              <FormattedTimestamp
                timestamp={repost.created_at}
                className="shrink-0"
                short={isSmallScreen}
              />
            </div>
          </div>
        </div>
      ))}

      <div ref={bottomRef} />

      <div className="mt-2 text-center text-sm text-muted-foreground">
        {filteredReposts.length > 0 ? t('No more reposts') : t('No reposts yet')}
      </div>
    </div>
  )
}
