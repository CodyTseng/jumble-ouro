import MuteButton from '@/components/MuteButton'
import Nip05 from '@/components/Nip05'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/UserAvatar'
import Username from '@/components/Username'
import { useFetchProfile } from '@/hooks'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useMuteList } from '@/providers/MuteListProvider'
import { useNostr } from '@/providers/NostrProvider'
import { Loader, Lock, Unlock } from 'lucide-react'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NotFoundPage from '../NotFoundPage'

const MuteListPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { profile, pubkey } = useNostr()
  const { getMutePubkeys } = useMuteList()
  const mutePubkeys = useMemo(() => getMutePubkeys(), [pubkey])
  const [visibleMutePubkeys, setVisibleMutePubkeys] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleMutePubkeys(mutePubkeys.slice(0, 10))
  }, [mutePubkeys])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '10px',
      threshold: 1
    }

    const observerInstance = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && mutePubkeys.length > visibleMutePubkeys.length) {
        setVisibleMutePubkeys((prev) => [
          ...prev,
          ...mutePubkeys.slice(prev.length, prev.length + 10)
        ])
      }
    }, options)

    const currentBottomRef = bottomRef.current
    if (currentBottomRef) {
      observerInstance.observe(currentBottomRef)
    }

    return () => {
      if (observerInstance && currentBottomRef) {
        observerInstance.unobserve(currentBottomRef)
      }
    }
  }, [visibleMutePubkeys, mutePubkeys])

  if (!profile) {
    return <NotFoundPage />
  }

  return (
    <SecondaryPageLayout
      ref={ref}
      index={index}
      title={t("username's muted", { username: profile.username })}
      displayScrollToTopButton
    >
      <div className="space-y-2 px-4 pt-2">
        {visibleMutePubkeys.map((pubkey, index) => (
          <UserItem key={`${index}-${pubkey}`} pubkey={pubkey} />
        ))}
        {mutePubkeys.length > visibleMutePubkeys.length && <div ref={bottomRef} />}
      </div>
    </SecondaryPageLayout>
  )
})
MuteListPage.displayName = 'MuteListPage'
export default MuteListPage

function UserItem({ pubkey }: { pubkey: string }) {
  const { changing, getMuteType, switchToPrivateMute, switchToPublicMute } = useMuteList()
  const { profile } = useFetchProfile(pubkey)
  const muteType = useMemo(() => getMuteType(pubkey), [pubkey, getMuteType])
  const [switching, setSwitching] = useState(false)

  return (
    <div className="flex items-start gap-2">
      <UserAvatar userId={pubkey} className="shrink-0" />
      <div className="w-full overflow-hidden">
        <Username
          userId={pubkey}
          className="w-fit max-w-full truncate font-semibold"
          skeletonClassName="h-4"
        />
        <Nip05 pubkey={pubkey} />
        <div className="truncate text-sm text-muted-foreground">{profile?.about}</div>
      </div>
      <div className="flex items-center gap-2">
        {switching ? (
          <Button disabled variant="ghost" size="icon">
            <Loader className="animate-spin" />
          </Button>
        ) : muteType === 'private' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (switching) return

              setSwitching(true)
              switchToPublicMute(pubkey).finally(() => setSwitching(false))
            }}
            disabled={changing}
          >
            <Lock className="text-green-400" />
          </Button>
        ) : muteType === 'public' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (switching) return

              setSwitching(true)
              switchToPrivateMute(pubkey).finally(() => setSwitching(false))
            }}
            disabled={changing}
          >
            <Unlock className="text-muted-foreground" />
          </Button>
        ) : null}
        <MuteButton pubkey={pubkey} />
      </div>
    </div>
  )
}
