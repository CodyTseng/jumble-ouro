import { useMinuteTick } from '@/hooks/useMinuteTick'
import dayjs from 'dayjs'
import { Event } from 'nostr-tools'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function getExpirationTimestamp(event: Event): number | null {
  const tag = event.tags.find((t) => t[0] === 'expiration')
  if (!tag || !tag[1]) return null
  const ts = parseInt(tag[1], 10)
  return isNaN(ts) ? null : ts
}

export default function ExpirationBadge({ event }: { event: Event }) {
  const { t } = useTranslation()
  const expirationTs = useMemo(() => getExpirationTimestamp(event), [event])

  const isExpired = expirationTs !== null && expirationTs * 1000 <= Date.now()
  useMinuteTick(expirationTs !== null && !isExpired)

  if (expirationTs === null || isExpired) return null

  const diffMs = expirationTs * 1000 - Date.now()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let countdownText: string
  if (diffMinutes < 1) {
    countdownText = t('Expires in {{time}}', { time: '< 1m' })
  } else if (diffHours < 1) {
    countdownText = t('Expires in {{time}}', { time: `${diffMinutes}m` })
  } else if (diffDays < 1) {
    countdownText = t('Expires in {{time}}', { time: `${diffHours}h` })
  } else if (diffDays < 60) {
    countdownText = t('Expires in {{time}}', { time: `${diffDays}d` })
  } else {
    countdownText = t('Expires in {{time}}', {
      time: dayjs(expirationTs * 1000).toDate().toLocaleDateString()
    })
  }

  const tooltipText = t('Ephemeral note — expires at {{datetime}} (NIP-40)', {
    datetime: dayjs(expirationTs * 1000)
      .toDate()
      .toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })
  })

  return (
    <div
      className="flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5"
      title={tooltipText}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3"
      >
        <path d="M5 22h14" />
        <path d="M5 2h14" />
        <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
        <path d="M17 2v4.172a2 2 0 0 1-.586 1.414L12 12l-4.414-4.414A2 2 0 0 1 7 6.172V2" />
      </svg>
      <span className="text-xs leading-none text-amber-600 dark:text-amber-400">
        {countdownText}
      </span>
    </div>
  )
}
