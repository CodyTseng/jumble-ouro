import NoteCard from '@/components/NoteCard'
import { SimpleUsername } from '@/components/Username'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import userAggregationService from '@/services/user-aggregation.service'
import { nip19, NostrEvent } from 'nostr-tools'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const UserAggregationDetailPage = forwardRef(
  (
    {
      feedId,
      npub,
      index
    }: {
      feedId?: string
      npub?: string
      index?: number
    },
    ref
  ) => {
    const { t } = useTranslation()
    const [aggregation, setAggregation] = useState<NostrEvent[]>([])

    const pubkey = useMemo(() => {
      if (!npub) return undefined
      try {
        const { type, data } = nip19.decode(npub)
        if (type === 'npub') return data
        if (type === 'nprofile') return data.pubkey
      } catch {
        return undefined
      }
    }, [npub])

    useEffect(() => {
      if (!feedId || !pubkey) {
        setAggregation([])
        return
      }

      const updateEvents = () => {
        const events = userAggregationService.getAggregation(feedId, pubkey)
        setAggregation(events)
      }

      const unSub = userAggregationService.subscribeAggregationChange(feedId, pubkey, () => {
        updateEvents()
      })

      updateEvents()

      return unSub
    }, [feedId, pubkey, setAggregation])

    if (!pubkey || !feedId) {
      return (
        <SecondaryPageLayout ref={ref} index={index} title={t('User Posts')}>
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            {t('Invalid user')}
          </div>
        </SecondaryPageLayout>
      )
    }

    return (
      <SecondaryPageLayout
        ref={ref}
        index={index}
        title={<SimpleUsername userId={pubkey} className="truncate" />}
        displayScrollToTopButton
      >
        <div className="min-h-screen">
          {aggregation.map((event) => (
            <NoteCard key={event.id} className="w-full" event={event} filterMutedNotes={false} />
          ))}
          <div className="mt-2 text-center text-sm text-muted-foreground">{t('no more notes')}</div>
        </div>
      </SecondaryPageLayout>
    )
  }
)

UserAggregationDetailPage.displayName = 'UserAggregationDetailPage'

export default UserAggregationDetailPage
