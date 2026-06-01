import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useFetchRelayList } from '@/hooks'
import { normalizeUrl, simplifyUrl } from '@/lib/url'
import { useNostr } from '@/providers/NostrProvider'
import { Loader } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function SharedRelays({ pubkey }: { pubkey: string }) {
  const { t } = useTranslation()
  const { relayList: myRelayList } = useNostr()
  const { relayList: theirRelayList, isFetching } = useFetchRelayList(pubkey)

  const sharedRelays = useMemo(() => {
    if (!myRelayList) return []
    const myNormalized = new Set(myRelayList.originalRelays.map((r) => normalizeUrl(r.url)))
    return theirRelayList.originalRelays
      .filter((r) => myNormalized.has(normalizeUrl(r.url)))
      .map((r) => r.url)
  }, [myRelayList, theirRelayList])

  const isLoading = isFetching || !myRelayList

  return (
    <Popover>
      <PopoverTrigger className="flex w-fit items-center gap-1 hover:underline">
        {isLoading ? <Loader className="size-4 animate-spin" /> : sharedRelays.length}
        <div className="text-muted-foreground">{t('Shared')}</div>
      </PopoverTrigger>
      <PopoverContent className="max-h-60 overflow-y-auto">
        <div className="mb-2 font-semibold">{t('Shared Relays')}</div>
        {sharedRelays.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t('No shared relays')}</div>
        ) : (
          <div className="space-y-1">
            {sharedRelays.map((url) => (
              <div key={url} className="truncate text-sm">
                {simplifyUrl(url)}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
