import MainNoteCard from '@/components/NoteCard/MainNoteCard'
import { NoteCardLoadingSkeleton } from '@/components/NoteCard'
import { SimpleUsername } from '@/components/Username'
import { ALLOWED_FILTER_KINDS } from '@/constants'
import { toProfile } from '@/lib/link'
import client from '@/services/client.service'
import { SecondaryPageLink } from '@/PageManager'
import { Event } from 'nostr-tools'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function MoreFromAuthor({
  event
}: {
  event: Event
}) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchNotes() {
      setIsLoading(true)
      try {
        const relayList = await client.fetchRelayList(event.pubkey)
        const events = await client.fetchEvents(relayList.write, {
          authors: [event.pubkey],
          kinds: ALLOWED_FILTER_KINDS,
          limit: 6
        })
        if (cancelled) return
        const filtered = events.filter((e) => e.id !== event.id).slice(0, 5)
        setNotes(filtered)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchNotes()
    return () => {
      cancelled = true
    }
  }, [event.pubkey, event.id])

  if (!isLoading && notes.length === 0) return null

  return (
    <div className="mt-4 px-4 pb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          {t('More from')}
          <SimpleUsername userId={event.pubkey} className="text-foreground" withoutSkeleton />
        </h3>
        <SecondaryPageLink
          to={toProfile(event.pubkey)}
          className="text-xs text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {t('View profile')}
        </SecondaryPageLink>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <NoteCardLoadingSkeleton />
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <MainNoteCard key={note.id} event={note} embedded />
          ))}
        </div>
      )}
    </div>
  )
}
