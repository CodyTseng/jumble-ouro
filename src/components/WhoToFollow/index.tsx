import FollowButton from '@/components/FollowButton'
import Nip05 from '@/components/Nip05'
import UserAvatar from '@/components/UserAvatar'
import Username from '@/components/Username'
import { useFetchProfile } from '@/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { useFollowList } from '@/providers/FollowListProvider'
import { useMuteList } from '@/providers/MuteListProvider'
import { useNostr } from '@/providers/NostrProvider'
import client from '@/services/client.service'
import { UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const MAX_FOLLOWINGS_TO_CHECK = 30
const MAX_SUGGESTIONS = 5

function SuggestionCard({ pubkey }: { pubkey: string }) {
  const { profile } = useFetchProfile(pubkey)

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <UserAvatar userId={pubkey} size="normal" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Username userId={pubkey} className="truncate text-sm font-semibold" />
        </div>
        <Nip05 pubkey={pubkey} />
        {profile?.about && (
          <div className="line-clamp-1 text-sm text-muted-foreground">{profile.about}</div>
        )}
      </div>
      <div className="shrink-0">
        <FollowButton pubkey={pubkey} />
      </div>
    </div>
  )
}

export default function WhoToFollow() {
  const { t } = useTranslation()
  const { pubkey: accountPubkey } = useNostr()
  const { followingSet } = useFollowList()
  const { mutePubkeySet } = useMuteList()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accountPubkey) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function computeSuggestions() {
      try {
        const followings = await client.fetchFollowings(accountPubkey!)
        if (cancelled || followings.length === 0) {
          setLoading(false)
          return
        }

        const subset = followings.slice(0, MAX_FOLLOWINGS_TO_CHECK)
        const frequencyMap = new Map<string, number>()

        const followingsOfFollowings = await Promise.all(
          subset.map((f) => client.fetchFollowings(f, false))
        )

        if (cancelled) return

        const excludeSet = new Set([accountPubkey!, ...followings, ...mutePubkeySet])

        for (const list of followingsOfFollowings) {
          for (const pk of list) {
            if (!excludeSet.has(pk)) {
              frequencyMap.set(pk, (frequencyMap.get(pk) ?? 0) + 1)
            }
          }
        }

        const sorted = Array.from(frequencyMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, MAX_SUGGESTIONS)
          .map(([pk]) => pk)

        if (!cancelled) {
          setSuggestions(sorted)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    computeSuggestions()
    return () => {
      cancelled = true
    }
  }, [accountPubkey])

  if (!accountPubkey) return null

  if (loading) {
    return (
      <div className="py-3">
        <div className="mb-2 flex items-center gap-2 px-4 text-sm font-semibold text-muted-foreground">
          <UserPlus className="h-4 w-4" />
          {t('Who to Follow')}
        </div>
        <div className="space-y-2 px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const visibleSuggestions = suggestions.filter((pk) => !followingSet.has(pk))

  if (visibleSuggestions.length === 0) return null

  return (
    <div className="py-3">
      <div className="mb-2 flex items-center gap-2 px-4 text-sm font-semibold text-muted-foreground">
        <UserPlus className="h-4 w-4" />
        {t('Who to Follow')}
      </div>
      <div>
        {visibleSuggestions.map((pubkey) => (
          <SuggestionCard key={pubkey} pubkey={pubkey} />
        ))}
      </div>
    </div>
  )
}
