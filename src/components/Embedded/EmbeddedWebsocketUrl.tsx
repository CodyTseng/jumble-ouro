import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useFetchRelayInfo } from '@/hooks'
import { toRelay } from '@/lib/link'
import { simplifyUrl } from '@/lib/url'
import { isTouchDevice } from '@/lib/utils'
import { SecondaryPageLink } from '@/PageManager'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import RelayIcon from '../RelayIcon'

export function EmbeddedWebsocketUrl({ url }: { url: string }) {
  const { relayInfo } = useFetchRelayInfo(url)
  const supportTouch = useMemo(() => isTouchDevice(), [])

  const displayName = relayInfo?.name || simplifyUrl(url)

  const trigger = (
    <SecondaryPageLink
      to={toRelay(url)}
      className="inline-flex items-center gap-1 text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <RelayIcon
        url={url}
        className="inline-block h-4 w-4 align-middle"
        classNames={{ fallback: 'h-3.5 w-3.5' }}
      />
      <span>{displayName}</span>
    </SecondaryPageLink>
  )

  if (supportTouch) {
    return trigger
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-72">
        <RelayPreviewCard url={url} />
      </HoverCardContent>
    </HoverCard>
  )
}

function RelayPreviewCard({ url }: { url: string }) {
  const { t } = useTranslation()
  const { relayInfo } = useFetchRelayInfo(url)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <RelayIcon url={url} className="h-8 w-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">
            {relayInfo?.name || simplifyUrl(url)}
          </div>
          {relayInfo?.name && (
            <div className="truncate text-xs text-muted-foreground">
              {simplifyUrl(url)}
            </div>
          )}
        </div>
      </div>
      {relayInfo?.description && (
        <div className="line-clamp-2 text-sm text-muted-foreground">
          {relayInfo.description}
        </div>
      )}
      {(!!relayInfo?.tags?.length ||
        relayInfo?.limitation?.auth_required ||
        relayInfo?.limitation?.payment_required) && (
        <div className="flex flex-wrap gap-1">
          {relayInfo.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {relayInfo.limitation?.auth_required && (
            <Badge variant="outline" className="text-xs">
              {t('Auth Required')}
            </Badge>
          )}
          {relayInfo.limitation?.payment_required && (
            <Badge variant="outline" className="text-xs">
              {t('Payment Required')}
            </Badge>
          )}
        </div>
      )}
      {!relayInfo?.name && !relayInfo?.description && (
        <div className="text-xs text-muted-foreground">{url}</div>
      )}
    </div>
  )
}
