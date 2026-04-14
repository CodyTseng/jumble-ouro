import { useFetchFollowings } from '@/hooks'
import { toFollowingList } from '@/lib/link'
import { SecondaryPageLink } from '@/PageManager'
import { useFollowList } from '@/providers/FollowListProvider'
import { useNostr } from '@/providers/NostrProvider'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Followings({ pubkey }: { pubkey: string }) {
  const { t } = useTranslation()
  const { pubkey: accountPubkey } = useNostr()
  const { followingSet: selfFollowingSet } = useFollowList()
  const { followings, isFetching } = useFetchFollowings(pubkey)

  return (
    <SecondaryPageLink
      to={toFollowingList(pubkey)}
      className="flex w-fit items-center gap-1 hover:underline"
    >
      {accountPubkey === pubkey ? (
        selfFollowingSet.size
      ) : isFetching ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        followings.length
      )}
      <div className="text-muted-foreground">{t('Following')}</div>
    </SecondaryPageLink>
  )
}
