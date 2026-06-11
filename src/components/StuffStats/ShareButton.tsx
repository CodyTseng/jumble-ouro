import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerOverlay } from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useStuff } from '@/hooks/useStuff'
import { toJumbleNote } from '@/lib/link'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { Copy, Link, Share2 } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function ShareButton({ stuff }: { stuff: Event | string }) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const { event } = useStuff(stuff)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const trigger = (
    <button
      data-action="share"
      className="flex h-full items-center px-3 text-muted-foreground enabled:hover:text-foreground"
      disabled={!event}
      title={t('Share')}
      onClick={() => {
        if (!event) return
        if (isSmallScreen) {
          setIsDrawerOpen(true)
        }
      }}
    >
      <Share2 />
    </button>
  )

  if (!event) {
    return trigger
  }

  const shareUrl = toJumbleNote(event)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
      }
    }
    navigator.clipboard.writeText(shareUrl)
    toast.success(t('Copied'))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success(t('Copied'))
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(event.content)
    toast.success(t('Copied'))
  }

  if (isSmallScreen) {
    return (
      <>
        {trigger}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerOverlay onClick={() => setIsDrawerOpen(false)} />
          <DrawerContent hideOverlay>
            <div className="py-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDrawerOpen(false)
                  handleShare()
                }}
                className="w-full justify-start gap-4 p-6 text-lg [&_svg]:size-5"
                variant="ghost"
              >
                <Share2 /> {t('Share')}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDrawerOpen(false)
                  handleCopyContent()
                }}
                className="w-full justify-start gap-4 p-6 text-lg [&_svg]:size-5"
                variant="ghost"
              >
                <Copy /> {t('Copy note content')}
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleCopyLink()
          }}
        >
          <Link /> {t('Copy link')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            handleCopyContent()
          }}
        >
          <Copy /> {t('Copy note content')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
