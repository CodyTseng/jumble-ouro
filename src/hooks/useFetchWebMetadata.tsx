import { isInsecureUrl } from '@/lib/url'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import webService from '@/services/web.service'
import { TWebMetadata } from '@/types'
import { useEffect, useState } from 'react'

export function useFetchWebMetadata(url: string) {
  const { allowInsecureConnection } = useUserPreferences()
  const [metadata, setMetadata] = useState<TWebMetadata>({})
  const [loading, setLoading] = useState(true)
  const proxyServer = import.meta.env.VITE_PROXY_SERVER
  if (proxyServer) {
    url = `${proxyServer}/sites/${encodeURIComponent(url)}`
  }

  useEffect(() => {
    if (!allowInsecureConnection && isInsecureUrl(url)) return

    webService.fetchWebMetadata(url).then((metadata) => {
      setMetadata(metadata)
      setLoading(false)
    })
  }, [url, allowInsecureConnection])

  return { ...metadata, loading }
}
