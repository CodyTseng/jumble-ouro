import { userIdToPubkey } from '@/lib/pubkey'
import { useFollowList } from '@/providers/FollowListProvider'
import { useNostr } from '@/providers/NostrProvider'
import { Loader, UserPlus, UserRoundCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FollowingBadge({ pubkey, userId }: { pubkey?: string; userId?: string }) {
  const { t } = useTranslation()
  const { pubkey: accountPubkey, checkLogin } = useNostr()
  const { followingSet, follow } = useFollowList()
  const [updating, setUpdating] = useState(false)

  const resolvedPubkey = useMemo(() => {
    if (pubkey) return pubkey
    return userId ? userIdToPubkey(userId) : undefined
  }, [pubkey, userId])

  const isFollowing = useMemo(() => {
    return resolvedPubkey ? followingSet.has(resolvedPubkey) : false
  }, [followingSet, resolvedPubkey])

  if (!accountPubkey || !resolvedPubkey || resolvedPubkey === accountPubkey) return null

  if (isFollowing) {
    return (
      <div className="flex items-center rounded-full bg-muted px-2 py-0.5" title={t('Following')}>
        <UserRoundCheck className="!size-3" />
      </div>
    )
  }

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    checkLogin(async () => {
      setUpdating(true)
      try {
        await follow(resolvedPubkey)
      } finally {
        setUpdating(false)
      }
    })
  }

  return (
    <button
      className="flex items-center rounded-full bg-muted px-2 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      title={t('Follow')}
      onClick={handleFollow}
      disabled={updating}
    >
      {updating ? (
        <Loader className="!size-3 animate-spin" />
      ) : (
        <UserPlus className="!size-3" />
      )}
    </button>
  )
}
