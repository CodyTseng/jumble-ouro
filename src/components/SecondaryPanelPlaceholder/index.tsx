import Icon from '@/assets/Icon'
import { useTranslation } from 'react-i18next'

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-xs font-medium">
      {children}
    </kbd>
  )
}

export default function SecondaryPanelPlaceholder() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-8">
      <Icon className="h-16 w-16 text-muted-foreground/30" />
      <p className="text-center text-sm text-muted-foreground">
        {t('Select a note, profile, or relay to view here')}
      </p>
      <div className="flex flex-col gap-2 text-xs text-muted-foreground/70">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Kbd>j</Kbd>
            <span>/</span>
            <Kbd>k</Kbd>
          </div>
          <span>{t('Navigate notes')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>Enter</Kbd>
          <span>{t('Open note')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>?</Kbd>
          <span>{t('All shortcuts')}</span>
        </div>
      </div>
    </div>
  )
}
