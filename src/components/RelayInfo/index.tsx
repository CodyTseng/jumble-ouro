import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { IS_COMMUNITY_MODE } from '@/constants'
import { useFetchRelayInfo } from '@/hooks'
import { createFakeEvent } from '@/lib/event'
import { checkNip43Support } from '@/lib/relay'
import { normalizeHttpUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useNostr } from '@/providers/NostrProvider'
import { Check, Copy, ExternalLink, GitBranch, Mail, Share2, SquareCode } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Content from '../Content'
import PostEditor from '../PostEditor'
import RelayIcon from '../RelayIcon'
import RelayMembershipControl from '../RelayMembershipControl'
import SaveRelayDropdownMenu from '../SaveRelayDropdownMenu'
import UserAvatar from '../UserAvatar'
import Username from '../Username'
import RelayReviewsPreview from './RelayReviewsPreview'

const NIP_FEATURE_MAP: Record<number, string> = {
  1: 'Notes',
  2: 'Contacts',
  4: 'Encrypted DMs',
  9: 'Event Deletion',
  11: 'Relay Info',
  17: 'Private Messages',
  28: 'Channels',
  40: 'Expiration',
  42: 'Authentication',
  43: 'Relay Access',
  45: 'Event Counts',
  50: 'Search',
  56: 'Reporting',
  57: 'Zaps',
  65: 'Relay Lists',
  70: 'Protected Events',
  96: 'File Storage'
}

export default function RelayInfo({ url, className }: { url: string; className?: string }) {
  const { t } = useTranslation()
  const { checkLogin } = useNostr()
  const { relayInfo, isFetching } = useFetchRelayInfo(url)
  const [open, setOpen] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const supportsNip43 = useMemo(() => checkNip43Support(relayInfo), [relayInfo])
  const shouldShowPostButton = useMemo(() => !supportsNip43 || isMember, [supportsNip43, isMember])

  if (isFetching || !relayInfo) {
    return null
  }

  return (
    <div className={cn('mb-2 space-y-4', className)}>
      <div className="space-y-4 px-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2">
              <RelayIcon url={url} className="h-8 w-8" />
              <div className="w-0 flex-1 select-text truncate text-2xl font-semibold">
                {relayInfo.name || relayInfo.shortUrl}
              </div>
            </div>
            <RelayControls url={relayInfo.url} />
          </div>
          {(!!relayInfo.tags?.length ||
            relayInfo.limitation?.auth_required ||
            relayInfo.limitation?.payment_required) && (
            <div className="flex flex-wrap gap-2">
              {relayInfo.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {relayInfo.limitation?.auth_required && (
                <Badge variant="outline">{t('Auth Required')}</Badge>
              )}
              {relayInfo.limitation?.payment_required && (
                <Badge variant="outline">{t('Payment Required')}</Badge>
              )}
            </div>
          )}
          {relayInfo.payments_url && (
            <a
              href={relayInfo.payments_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1 text-sm text-primary hover:underline"
            >
              {t('Relay payment page')}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {relayInfo.description && (
            <div className="mt-2 select-text whitespace-pre-wrap text-wrap break-words">
              <Content event={createFakeEvent({ content: relayInfo.description })} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">{t('Homepage')}</div>
          <a
            href={normalizeHttpUrl(relayInfo.url)}
            target="_blank"
            className="block w-fit max-w-full select-text truncate text-primary hover:underline"
          >
            {normalizeHttpUrl(relayInfo.url)}
          </a>
        </div>

        {!!relayInfo.supported_nips?.length && (() => {
          const features = relayInfo.supported_nips
            .filter((nip) => NIP_FEATURE_MAP[nip])
            .map((nip) => ({ nip, label: NIP_FEATURE_MAP[nip] }))
          if (features.length === 0) return null
          return (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-muted-foreground">
                {t('Supported Features')}
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map(({ nip, label }) => (
                  <Badge key={nip} variant="secondary">
                    {t(label)}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })()}

        <ScrollArea className="overflow-x-auto">
          <div className="flex gap-8 pb-2">
            {relayInfo.pubkey && (
              <div className="w-fit space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">{t('Operator')}</div>
                <div className="flex items-center gap-2">
                  <UserAvatar userId={relayInfo.pubkey} size="small" />
                  <Username userId={relayInfo.pubkey} className="text-nowrap font-semibold" />
                </div>
              </div>
            )}
            {relayInfo.contact && (
              <div className="w-fit space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">{t('Contact')}</div>
                <div className="flex select-text items-center gap-2 text-nowrap font-semibold">
                  <Mail />
                  {relayInfo.contact}
                </div>
              </div>
            )}
            {relayInfo.software && (
              <div className="w-fit space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">{t('Software')}</div>
                <div className="flex select-text items-center gap-2 text-nowrap font-semibold">
                  <SquareCode />
                  {formatSoftware(relayInfo.software)}
                </div>
              </div>
            )}
            {relayInfo.version && (
              <div className="w-fit space-y-2">
                <div className="text-sm font-semibold text-muted-foreground">{t('Version')}</div>
                <div className="flex select-text items-center gap-2 text-nowrap font-semibold">
                  <GitBranch />
                  {relayInfo.version}
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <RelayMembershipControl relayInfo={relayInfo} onMembershipStatusChange={setIsMember} />
        {shouldShowPostButton && (
          <>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => checkLogin(() => setOpen(true))}
            >
              {t('Share something on this Relay')}
            </Button>
            <PostEditor open={open} setOpen={setOpen} openFrom={[relayInfo.url]} />
          </>
        )}
      </div>
      <RelayReviewsPreview relayUrl={url} />
    </div>
  )
}

function formatSoftware(software: string) {
  const parts = software.split('/')
  return parts[parts.length - 1]
}

function RelayControls({ url }: { url: string }) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedShareableUrl, setCopiedShareableUrl] = useState(false)

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleCopyShareableUrl = () => {
    navigator.clipboard.writeText(`https://jumble.social/?r=${url}`)
    setCopiedShareableUrl(true)
    toast.success('Shareable URL copied to clipboard')
    setTimeout(() => setCopiedShareableUrl(false), 2000)
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="titlebar-icon" onClick={handleCopyShareableUrl}>
        {copiedShareableUrl ? <Check /> : <Share2 />}
      </Button>
      <Button variant="ghost" size="titlebar-icon" onClick={handleCopyUrl}>
        {copiedUrl ? <Check /> : <Copy />}
      </Button>
      {!IS_COMMUNITY_MODE && <SaveRelayDropdownMenu urls={[url]} bigButton />}
    </div>
  )
}
