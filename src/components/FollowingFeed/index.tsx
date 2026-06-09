import NormalFeed from '@/components/NormalFeed'
import { SPECIAL_FEED_ID } from '@/constants'
import { usePrimaryPage } from '@/PageManager'
import { useFollowList } from '@/providers/FollowListProvider'
import { useNostr } from '@/providers/NostrProvider'
import client from '@/services/client.service'
import { TFeedSubRequest } from '@/types'
import { Radio, Search, TrendingUp, UserPlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FollowingFeed() {
  const { t } = useTranslation()
  const { pubkey } = useNostr()
  const { followingSet } = useFollowList()
  const { navigate } = usePrimaryPage()
  const [subRequests, setSubRequests] = useState<TFeedSubRequest[]>([])
  const [hasFollowings, setHasFollowings] = useState<boolean | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return

    async function init() {
      if (!pubkey) {
        setSubRequests([])
        setHasFollowings(null)
        return
      }

      const followings = await client.fetchFollowings(pubkey)
      setHasFollowings(followings.length > 0)
      setSubRequests(await client.generateSubRequestsForPubkeys([pubkey, ...followings], pubkey))

      if (followings.length) {
        initializedRef.current = true
      }
    }

    init()
  }, [pubkey, followingSet, refreshCount])

  // Show empty state when user has no followings
  if (hasFollowings === false && subRequests.length > 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <UserPlus size={64} className="mb-4 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="mb-2 text-2xl font-semibold">{t('Welcome to Jumble!')}</h2>
        <p className="mb-6 max-w-md text-muted-foreground">
          {t(
            'Start by browsing relay feeds to discover content, or search for people you know.'
          )}
        </p>
        <div className="grid w-full max-w-lg gap-3 sm:grid-cols-3">
          <button
            onClick={() => navigate('home')}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-primary bg-primary/5 p-4 transition-colors hover:bg-primary/10"
          >
            <Radio className="size-8 text-primary" />
            <span className="text-sm font-semibold">{t('Browse Relay Feeds')}</span>
            <span className="text-xs text-muted-foreground">
              {t('Explore content from Nostr relays')}
            </span>
          </button>
          <button
            onClick={() => navigate('search')}
            className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors hover:bg-muted"
          >
            <TrendingUp className="size-8 text-muted-foreground" />
            <span className="text-sm font-semibold">{t('Discover Trending')}</span>
            <span className="text-xs text-muted-foreground">
              {t('See trending topics and popular notes')}
            </span>
          </button>
          <button
            onClick={() => navigate('search')}
            className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors hover:bg-muted"
          >
            <Search className="size-8 text-muted-foreground" />
            <span className="text-sm font-semibold">{t('Search Users')}</span>
            <span className="text-xs text-muted-foreground">
              {t('Find and follow people you know')}
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <NormalFeed
      feedId={SPECIAL_FEED_ID.FOLLOWING}
      subRequests={subRequests}
      onRefresh={() => {
        initializedRef.current = false
        setRefreshCount((count) => count + 1)
      }}
      isMainFeed
      isPubkeyFeed
    />
  )
}
