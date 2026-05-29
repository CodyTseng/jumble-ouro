import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OfflineBanner() {
  const { isOnline, justReconnected } = useNetworkStatus()
  const { t } = useTranslation()

  if (isOnline && !justReconnected) return null

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 flex h-9 items-center justify-center gap-2 text-sm font-medium text-white animate-in slide-in-from-top ${
        isOnline
          ? 'bg-green-600/90 dark:bg-green-700/90'
          : 'bg-amber-500/90 dark:bg-amber-600/90'
      }`}
    >
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      {isOnline ? t('Back online') : t('You are offline')}
    </div>
  )
}
