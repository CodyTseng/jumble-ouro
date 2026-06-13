import { useFetchRelayInfo } from '@/hooks/useFetchRelayInfo'
import { simplifyUrl } from '@/lib/url'

export default function RelayName({ url }: { url?: string }) {
  const { relayInfo } = useFetchRelayInfo(url)
  return <>{relayInfo?.name || simplifyUrl(url ?? '')}</>
}
