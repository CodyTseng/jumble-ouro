import { cn } from '@/lib/utils'
import { Event } from 'nostr-tools'
import { getPow } from 'nostr-tools/nip13'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function getEventPow(event: Event): number {
  const nonceTag = event.tags.find((t) => t[0] === 'nonce')
  if (!nonceTag) return 0
  return getPow(event.id)
}

export default function PowBadge({ event }: { event: Event }) {
  const { t } = useTranslation()
  const pow = useMemo(() => getEventPow(event), [event])

  if (pow < 1) return null

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full px-2 py-0.5',
        pow >= 20
          ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
          : 'bg-muted text-muted-foreground'
      )}
      title={t('Proof of Work: difficulty {{difficulty}} — this note was mined with computational effort (NIP-13)', { difficulty: pow })}
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
        <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
        <path d="m18 15 4-4" />
        <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5" />
      </svg>
      <span className="text-xs leading-none">
        {t('PoW {{difficulty}}', { difficulty: pow })}
      </span>
    </div>
  )
}
