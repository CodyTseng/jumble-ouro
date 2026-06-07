import { Separator } from '@/components/ui/separator'
import { useStuff } from '@/hooks/useStuff'
import { useStuffStatsById } from '@/hooks/useStuffStatsById'
import { createReactionDraftEvent } from '@/lib/draft-event'
import { toNote } from '@/lib/link'
import { getDefaultRelayUrls } from '@/lib/relay'
import { cn } from '@/lib/utils'
import { useSecondaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import client from '@/services/client.service'
import stuffStatsService from '@/services/stuff-stats.service'
import { Event } from 'nostr-tools'
import { useCallback, useMemo, useState } from 'react'
import Collapsible from '../Collapsible'
import Note from '../Note'
import StuffStats from '../StuffStats'
import DoubleTapLikeOverlay from './DoubleTapLikeOverlay'
import PinnedButton from './PinnedButton'
import RepostDescription from './RepostDescription'

export default function MainNoteCard({
  event,
  className,
  reposters,
  embedded,
  originalNoteId,
  pinned = false,
  highlighted = false
}: {
  event: Event
  className?: string
  reposters?: string[]
  embedded?: boolean
  originalNoteId?: string
  pinned?: boolean
  highlighted?: boolean
}) {
  const { push } = useSecondaryPage()
  const { pubkey, publish, checkLogin } = useNostr()
  const { quickReaction, quickReactionEmoji } = useUserPreferences()
  const { stuffKey } = useStuff(event)
  const noteStats = useStuffStatsById(stuffKey)
  const [showLikeOverlay, setShowLikeOverlay] = useState(false)

  const alreadyLiked = useMemo(() => {
    const stats = noteStats || {}
    return !!stats.likes?.find((like) => like.pubkey === pubkey)
  }, [noteStats, pubkey])

  const handleDoubleTapLike = useCallback(
    (e: React.MouseEvent) => {
      if (embedded) return
      if (!quickReaction) return

      const target = e.target as HTMLElement
      if (target.closest('button, a, [data-action]')) return

      e.stopPropagation()

      checkLogin(async () => {
        if (alreadyLiked || !pubkey) return

        setShowLikeOverlay(true)
        setTimeout(() => setShowLikeOverlay(false), 600)

        try {
          if (!noteStats?.updatedAt) {
            await stuffStatsService.fetchStuffStats(stuffKey, pubkey)
          }
          const reaction = createReactionDraftEvent(event, quickReactionEmoji)
          const seenOn = client.getSeenEventRelayUrls(event.id)
          const relayUrls = seenOn.length > 0 ? seenOn : getDefaultRelayUrls()
          const evt = await publish(reaction, { additionalRelayUrls: relayUrls })
          stuffStatsService.updateStuffStatsByEvents([evt])
        } catch {
          // Silently fail — the like button in the action bar provides error feedback
        }
      })
    },
    [
      embedded,
      quickReaction,
      alreadyLiked,
      pubkey,
      noteStats,
      stuffKey,
      event,
      quickReactionEmoji,
      publish,
      checkLogin
    ]
  )

  return (
    <div
      data-note-card
      className={className}
      onClick={(e) => {
        e.stopPropagation()
        push(toNote(originalNoteId ?? event))
      }}
      onDoubleClick={handleDoubleTapLike}
    >
      <div
        className={cn(
          'clickable transition-all duration-200',
          embedded ? 'rounded-xl border bg-card p-3 sm:p-4' : 'py-3 hover:bg-accent/30',
          highlighted && !embedded && 'animate-highlight-new'
        )}
      >
        {showLikeOverlay && <DoubleTapLikeOverlay emoji={quickReactionEmoji} />}
        <Collapsible alwaysExpand={embedded}>
          {pinned && <PinnedButton event={event} />}
          <RepostDescription className={embedded ? '' : 'px-4'} reposters={reposters} />
          <Note
            className={embedded ? '' : 'px-4'}
            size={embedded ? 'small' : 'normal'}
            event={event}
            originalNoteId={originalNoteId}
          />
        </Collapsible>
        {!embedded && <StuffStats className="mt-3 px-4" stuff={event} />}
      </div>
      {!embedded && <Separator />}
    </div>
  )
}
