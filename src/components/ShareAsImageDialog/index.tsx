import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { useFetchProfile } from '@/hooks'
import { getNoteBech32Id } from '@/lib/event'
import { formatPubkey } from '@/lib/pubkey'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import dayjs from 'dayjs'
import { toPng } from 'html-to-image'
import { Download, Loader, Share2 } from 'lucide-react'
import { Event } from 'nostr-tools'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

const MAX_CONTENT_LENGTH = 280
const CARD_WIDTH = 600

export default function ShareAsImageDialog({
  event,
  isOpen,
  closeDialog
}: {
  event: Event
  isOpen: boolean
  closeDialog: () => void
}) {
  const { isSmallScreen } = useScreenSize()

  if (isSmallScreen) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="hidden" />
            <DrawerDescription className="hidden" />
          </DrawerHeader>
          <div className="p-4">
            <ShareAsImageContent event={event} closeDialog={closeDialog} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />
        </DialogHeader>
        <ShareAsImageContent event={event} closeDialog={closeDialog} />
      </DialogContent>
    </Dialog>
  )
}

function ShareAsImageContent({ event, closeDialog }: { event: Event; closeDialog: () => void }) {
  const { t } = useTranslation()
  const { profile } = useFetchProfile(event.pubkey)
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const displayName = profile?.original_username || formatPubkey(event.pubkey)
  const initial = displayName.charAt(0).toUpperCase()
  const bech32Id = getNoteBech32Id(event)
  const truncatedId = bech32Id.length > 30 ? bech32Id.slice(0, 30) + '…' : bech32Id

  const content =
    event.content.length > MAX_CONTENT_LENGTH
      ? event.content.slice(0, MAX_CONTENT_LENGTH) + '…'
      : event.content

  const timestamp = dayjs(event.created_at * 1000).format('YYYY-MM-DD HH:mm')

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true
      })
      setImageUrl(dataUrl)
    } catch {
      toast.error(t('Failed to generate image'))
    } finally {
      setGenerating(false)
    }
  }, [t])

  useEffect(() => {
    const timer = setTimeout(generateImage, 100)
    return () => clearTimeout(timer)
  }, [generateImage])

  const handleDownload = useCallback(() => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.download = `nostr-${event.id.slice(0, 8)}.png`
    link.href = imageUrl
    link.click()
    closeDialog()
  }, [imageUrl, event.id, closeDialog])

  const handleShare = useCallback(async () => {
    if (!imageUrl) return
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `nostr-${event.id.slice(0, 8)}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        closeDialog()
        return
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        closeDialog()
        return
      }
    }
    handleDownload()
  }, [imageUrl, event.id, closeDialog, handleDownload])

  const initialColor = `hsl(${(event.pubkey.charCodeAt(0) * 37 + event.pubkey.charCodeAt(1) * 17) % 360}, 65%, 55%)`

  return (
    <div className="space-y-4">
      {/* Off-screen card for capture */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: CARD_WIDTH,
            padding: 32,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            borderRadius: 16,
            backgroundColor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: initialColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 20,
                flexShrink: 0
              }}
            >
              {initial}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'hsl(var(--muted-foreground))'
                }}
              >
                {timestamp}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: 24
            }}
          >
            {content}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid hsl(var(--muted))',
              paddingTop: 16,
              fontSize: 12,
              color: 'hsl(var(--muted-foreground))'
            }}
          >
            <span style={{ fontWeight: 500, color: 'hsl(var(--primary))' }}>via Jumble</span>
            <span
              style={{
                maxWidth: '60%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {truncatedId}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center">
        {generating || !imageUrl ? (
          <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
            <Loader className="animate-spin" />
            <span>{t('Generating image...')}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt=""
            className="w-full rounded-lg border"
            style={{ maxHeight: '60vh' }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1" variant="outline" onClick={handleDownload} disabled={!imageUrl}>
          <Download className="mr-2 h-4 w-4" />
          {t('Download image')}
        </Button>
        <Button className="flex-1" onClick={handleShare} disabled={!imageUrl}>
          <Share2 className="mr-2 h-4 w-4" />
          {t('Share image')}
        </Button>
      </div>
    </div>
  )
}
