import { useFetchRelayList } from '@/hooks'
import { toOthersRelaySettings, toRelaySettings } from '@/lib/link'
import { SecondaryPageLink } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Relays({ pubkey }: { pubkey: string }) {
  const { t } = useTranslation()
  const { pubkey: accountPubkey } = useNostr()
  const { relayList, isFetching } = useFetchRelayList(pubkey)

  return (
    <SecondaryPageLink
      to={accountPubkey === pubkey ? toRelaySettings('mailbox') : toOthersRelaySettings(pubkey)}
      className="flex w-fit items-center gap-1 hover:underline"
    >
      {isFetching ? <Loader className="size-4 animate-spin" /> : relayList.originalRelays.length}
      <div className="text-muted-foreground">{t('Relays')}</div>
    </SecondaryPageLink>
  )
}
