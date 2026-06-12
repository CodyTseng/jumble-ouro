import relayInfoService from '@/services/relay-info.service'
import { TRelayInfo } from '@/types'
import { useCallback, useEffect, useState } from 'react'

export function useFetchRelayInfo(url?: string) {
  const [isFetching, setIsFetching] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [relayInfo, setRelayInfo] = useState<TRelayInfo | undefined>(undefined)

  const fetchRelayInfo = useCallback(async () => {
    if (!url) return
    setIsFetching(true)
    setHasError(false)
    const timer = setTimeout(() => {
      setIsFetching(false)
    }, 5000)
    try {
      const info = await relayInfoService.getRelayInfo(url)
      setRelayInfo(info)
    } catch (err) {
      console.error(err)
      setHasError(true)
    } finally {
      clearTimeout(timer)
      setIsFetching(false)
    }
  }, [url])

  useEffect(() => {
    fetchRelayInfo()
  }, [fetchRelayInfo])

  return { relayInfo, isFetching, hasError, refetch: fetchRelayInfo }
}
