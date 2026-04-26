import Tabs from '@/components/Tabs'
import { SPECIAL_FEED_ID } from '@/constants'
import { useStuffStatsById } from '@/hooks/useStuffStatsById'
import { getEventKey } from '@/lib/event'
import { Event } from 'nostr-tools'
import { useMemo, useState } from 'react'
import QuoteList from '../QuoteList'
import ReactionList from '../ReactionList'
import ReplyNoteList from '../ReplyNoteList'
import RepostList from '../RepostList'
import TrustScoreFilter from '../TrustScoreFilter'
import ZapList from '../ZapList'

type TTabValue = 'replies' | 'quotes' | 'reactions' | 'reposts' | 'zaps'

export default function NoteInteractions({ event, opPubkey }: { event: Event; opPubkey?: string }) {
  const [type, setType] = useState<TTabValue>('replies')
  const stuffKey = getEventKey(event)
  const stats = useStuffStatsById(stuffKey)

  const tabs = useMemo(
    () => [
      { value: 'replies', label: 'Replies' },
      { value: 'zaps', label: 'Zaps', count: stats?.zaps?.length },
      { value: 'reposts', label: 'Reposts', count: stats?.reposts?.length },
      { value: 'reactions', label: 'Reactions', count: stats?.likes?.length },
      { value: 'quotes', label: 'Quotes' }
    ],
    [stats]
  )

  let list
  switch (type) {
    case 'replies':
      list = <ReplyNoteList stuff={event} opPubkey={opPubkey} />
      break
    case 'quotes':
      list = <QuoteList stuff={event} />
      break
    case 'reactions':
      list = <ReactionList stuff={event} />
      break
    case 'reposts':
      list = <RepostList event={event} />
      break
    case 'zaps':
      list = <ZapList event={event} />
      break
    default:
      break
  }

  return (
    <>
      <Tabs
        tabs={tabs}
        value={type}
        onTabChange={(tab) => setType(tab as TTabValue)}
        options={
          <TrustScoreFilter filterId={SPECIAL_FEED_ID.INTERACTIONS} />
        }
      />
      {list}
    </>
  )
}
