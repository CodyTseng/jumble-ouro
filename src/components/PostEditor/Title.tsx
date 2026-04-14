import { Event } from 'nostr-tools'
import { useTranslation } from 'react-i18next'

export default function Title({ parentStuff }: { parentStuff?: Event | string }) {
  const { t } = useTranslation()

  return parentStuff ? (
    <div className="flex w-full items-center gap-2">
      <div className="shrink-0">{t('Reply to')}</div>
      {typeof parentStuff === 'string' && (
        <div className="truncate text-primary">{parentStuff}</div>
      )}
    </div>
  ) : (
    t('New Note')
  )
}
