import { useFetchFollowings, useFetchProfile } from '@/hooks'
import { toFollowingList } from '@/lib/link'
import { userIdToPubkey } from '@/lib/pubkey'
import { SecondaryPageLink } from '@/PageManager'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useNostr } from '@/providers/NostrProvider'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FollowButton from '../FollowButton'
import Nip05 from '../Nip05'
import ProfileAbout from '../ProfileAbout'
import TextWithEmojis from '../TextWithEmojis'
import TrustScoreBadge from '../TrustScoreBadge'
import { SimpleUserAvatar } from '../UserAvatar'

export default function ProfileCard({ userId }: { userId: string }) {
  const { t } = useTranslation()
  const pubkey = useMemo(() => userIdToPubkey(userId), [userId])
  const { profile } = useFetchProfile(userId)
  const { autoLoadProfilePicture } = useContentPolicy()
  const { pubkey: accountPubkey } = useNostr()
  const { followings } = useFetchFollowings(pubkey)
  const { username, about, emojis } = profile || {}

  const isFollowingYou = useMemo(() => {
    return !!accountPubkey && accountPubkey !== pubkey && followings.includes(accountPubkey)
  }, [followings, pubkey, accountPubkey])

  return (
    <div className="not-prose flex w-full flex-col gap-2">
      {autoLoadProfilePicture && (
        <div className="flex w-full items-start justify-between space-x-2">
          <SimpleUserAvatar userId={pubkey} className="h-12 w-12" />
          <FollowButton pubkey={pubkey} />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TextWithEmojis
              text={username || ''}
              emojis={emojis}
              className="truncate text-lg font-semibold"
            />
            <TrustScoreBadge pubkey={pubkey} />
            {isFollowingYou && (
              <div className="h-fit shrink-0 rounded-full bg-muted px-2 text-xs text-muted-foreground">
                {t('Follows you')}
              </div>
            )}
          </div>
          <Nip05 pubkey={pubkey} />
        </div>
        {!autoLoadProfilePicture && <FollowButton pubkey={pubkey} />}
      </div>
      {about && (
        <ProfileAbout
          about={about}
          emojis={emojis}
          className="line-clamp-6 w-full overflow-hidden text-ellipsis text-wrap break-words text-sm"
        />
      )}
      {followings.length > 0 && (
        <SecondaryPageLink
          to={toFollowingList(pubkey)}
          className="flex w-fit items-center gap-1 text-sm hover:underline"
        >
          {followings.length}
          <span className="text-muted-foreground">{t('Following')}</span>
        </SecondaryPageLink>
      )}
    </div>
  )
}
