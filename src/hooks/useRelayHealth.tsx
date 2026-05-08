import { useEffect, useState } from 'react'

type TRelayHealthStatus = 'checking' | 'online' | 'offline'

const TIMEOUT_MS = 5000
const STAGGER_INTERVAL_MS = 200

export default function useRelayHealth(url: string, index: number) {
  const [status, setStatus] = useState<TRelayHealthStatus>('checking')
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined)

  useEffect(() => {
    let ws: WebSocket | null = null
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let unmounted = false

    const staggerId = setTimeout(() => {
      if (unmounted) return

      const wsUrl = url.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')
      const start = performance.now()

      try {
        ws = new WebSocket(wsUrl)
      } catch {
        if (!unmounted) setStatus('offline')
        return
      }

      timeoutId = setTimeout(() => {
        if (!unmounted) {
          setStatus('offline')
          ws?.close()
          ws = null
        }
      }, TIMEOUT_MS)

      ws.onopen = () => {
        if (unmounted) {
          ws?.close()
          return
        }
        clearTimeout(timeoutId)
        const elapsed = Math.round(performance.now() - start)
        setLatencyMs(elapsed)
        setStatus('online')
        ws?.close()
        ws = null
      }

      ws.onerror = () => {
        if (unmounted) return
        clearTimeout(timeoutId)
        setStatus('offline')
        ws?.close()
        ws = null
      }
    }, index * STAGGER_INTERVAL_MS)

    return () => {
      unmounted = true
      clearTimeout(staggerId)
      clearTimeout(timeoutId)
      if (ws) {
        ws.onopen = null
        ws.onerror = null
        ws.close()
      }
    }
  }, [url, index])

  return { status, latencyMs }
}
