import PostEditor from '@/components/PostEditor'
import { SimpleUserAvatar } from '@/components/UserAvatar'
import { useNostr } from '@/providers/NostrProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { hasBackgroundAudioAtom } from '@/services/media-manager.service'
import { useAtomValue } from 'jotai'
import { Event } from 'nostr-tools'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function QuickReplyBar({ event }: { event: Event }) {
  const { t } = useTranslation()
  const { pubkey, checkLogin } = useNostr()
  const { isSmallScreen } = useScreenSize()
  const hasBackgroundAudio = useAtomValue(hasBackgroundAudioAtom)
  const [open, setOpen] = useState(false)

  if (!pubkey) return null

  return (
    <>
      <div
        className="sticky z-20 flex w-full items-center gap-3 border-t bg-background px-4 py-2"
        style={{
          bottom: isSmallScreen
            ? `calc(env(safe-area-inset-bottom) + ${hasBackgroundAudio ? 6.5 : 3}rem)`
            : 0
        }}
        onClick={() => {
          checkLogin(() => {
            setOpen(true)
          })
        }}
      >
        <SimpleUserAvatar userId={pubkey} size="small" className="shrink-0" ignorePolicy />
        <div className="min-w-0 flex-1 cursor-pointer rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          {t('Add a reply...')}
        </div>
      </div>
      <PostEditor parentStuff={event} open={open} setOpen={setOpen} />
    </>
  )
}
