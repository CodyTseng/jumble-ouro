import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-xs font-medium">
      {children}
    </kbd>
  )
}

function ShortcutRow({ keys, label }: { keys: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">{keys}</div>
    </div>
  )
}

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const isMac = navigator.platform.toUpperCase().includes('MAC')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Keyboard shortcuts')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {t('Navigation')}
            </h3>
            <div className="space-y-0.5">
              <ShortcutRow
                keys={
                  <>
                    <Kbd>g</Kbd>
                    <span className="text-xs text-muted-foreground">{t('then')}</span>
                    <Kbd>h</Kbd>
                  </>
                }
                label={t('Go to Home')}
              />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>g</Kbd>
                    <span className="text-xs text-muted-foreground">{t('then')}</span>
                    <Kbd>n</Kbd>
                  </>
                }
                label={t('Go to Notifications')}
              />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>g</Kbd>
                    <span className="text-xs text-muted-foreground">{t('then')}</span>
                    <Kbd>d</Kbd>
                  </>
                }
                label={t('Go to DMs')}
              />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>g</Kbd>
                    <span className="text-xs text-muted-foreground">{t('then')}</span>
                    <Kbd>p</Kbd>
                  </>
                }
                label={t('Go to Profile')}
              />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>g</Kbd>
                    <span className="text-xs text-muted-foreground">{t('then')}</span>
                    <Kbd>b</Kbd>
                  </>
                }
                label={t('Go to Bookmarks')}
              />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>g</Kbd>
                    <span className="text-xs text-muted-foreground">{t('then')}</span>
                    <Kbd>s</Kbd>
                  </>
                }
                label={t('Go to Settings')}
              />
              <ShortcutRow
                keys={<Kbd>/</Kbd>}
                label={t('Go to Search')}
              />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                    <span className="text-xs text-muted-foreground">+</span>
                    <Kbd>K</Kbd>
                  </>
                }
                label={t('Go to Search')}
              />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {t('Feed')}
            </h3>
            <div className="space-y-0.5">
              <ShortcutRow keys={<Kbd>j</Kbd>} label={t('Next note')} />
              <ShortcutRow keys={<Kbd>k</Kbd>} label={t('Previous note')} />
              <ShortcutRow
                keys={
                  <>
                    <Kbd>Enter</Kbd>
                    <span className="text-xs text-muted-foreground">{t('or')}</span>
                    <Kbd>o</Kbd>
                  </>
                }
                label={t('Open note')}
              />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {t('Actions')}
            </h3>
            <div className="space-y-0.5">
              <ShortcutRow
                keys={<Kbd>n</Kbd>}
                label={t('New post')}
              />
              <ShortcutRow
                keys={<Kbd>?</Kbd>}
                label={t('Show keyboard shortcuts')}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
