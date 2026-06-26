import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useMinuteTick } from '@/hooks/useMinuteTick'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import { TIMESTAMP_FORMAT } from '@/constants'

export function FormattedTimestamp({
  timestamp,
  short = false,
  className
}: {
  timestamp: number
  short?: boolean
  className?: string
}) {
  const { timestampFormat } = useUserPreferences()
  const isAbsolute = timestampFormat === TIMESTAMP_FORMAT.ABSOLUTE

  const titleText = isAbsolute
    ? formatRelativeTitle(timestamp)
    : dayjs(timestamp * 1000)
        .toDate()
        .toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })

  return (
    <span className={className} title={titleText}>
      {isAbsolute ? (
        <AbsoluteTimestampContent timestamp={timestamp} short={short} />
      ) : (
        <RelativeTimestampContent timestamp={timestamp} short={short} />
      )}
    </span>
  )
}

function formatRelativeTitle(timestamp: number): string {
  const time = dayjs(timestamp * 1000)
  const now = dayjs()
  const diffMinute = now.diff(time, 'minute')
  if (diffMinute < 1) return 'just now'
  const diffHour = now.diff(time, 'hour')
  if (diffHour < 1) return `${diffMinute}m ago`
  const diffDay = now.diff(time, 'day')
  if (diffDay < 1) return `${diffHour}h ago`
  const diffMonth = now.diff(time, 'month')
  if (diffMonth < 2) return `${diffDay}d ago`
  return time.toDate().toLocaleDateString()
}

function AbsoluteTimestampContent({
  timestamp,
  short = false
}: {
  timestamp: number
  short?: boolean
}) {
  const date = dayjs(timestamp * 1000)
  const now = dayjs()

  const isToday = date.isSame(now, 'day')
  const isSameYear = date.isSame(now, 'year')

  useMinuteTick(isToday)

  const d = date.toDate()

  if (isToday) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }

  if (isSameYear) {
    if (short) {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function RelativeTimestampContent({
  timestamp,
  short = false
}: {
  timestamp: number
  short?: boolean
}) {
  const { t } = useTranslation()
  const time = dayjs(timestamp * 1000)
  const now = dayjs()

  const diffMonth = now.diff(time, 'month')
  useMinuteTick(diffMonth < 2)

  if (diffMonth >= 2) {
    return t('date', { timestamp: time.valueOf() })
  }

  const diffDay = now.diff(time, 'day')
  if (diffDay >= 1) {
    return short ? t('n d', { n: diffDay }) : t('day ago', { count: diffDay })
  }

  const diffHour = now.diff(time, 'hour')
  if (diffHour >= 1) {
    return short ? t('n h', { n: diffHour }) : t('hour ago', { count: diffHour })
  }

  const diffMinute = now.diff(time, 'minute')
  if (diffMinute >= 1) {
    return short ? t('n m', { n: diffMinute }) : t('minute ago', { count: diffMinute })
  }

  return t('just now')
}
