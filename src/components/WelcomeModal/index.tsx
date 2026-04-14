import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { StorageKey } from '@/constants'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const REPO_ISSUES_URL = 'https://github.com/CodyTseng/jumble-ouro/issues'

function markSeen() {
  try {
    window.localStorage.setItem(StorageKey.WELCOME_MODAL_SEEN, 'true')
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export default function WelcomeModal() {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let alreadySeen = false
    try {
      alreadySeen = window.localStorage.getItem(StorageKey.WELCOME_MODAL_SEEN) === 'true'
    } catch {
      alreadySeen = false
    }
    if (!alreadySeen) {
      setOpen(true)
      markSeen()
    }
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      markSeen()
    }
    setOpen(next)
  }

  const body = (
    <div className="space-y-4 text-sm">
      <p>
        {t(
          'Jumble Ouro is a community-driven Nostr client. Feature proposals submitted as GitHub issues are automatically implemented when the community votes for them.'
        )}
      </p>
      <div className="space-y-1">
        <div className="font-semibold">{t('How to propose a feature')}</div>
        <p className="text-muted-foreground">
          {t('Open a new GitHub issue describing the feature you want to see.')}
        </p>
      </div>
      <div className="space-y-1">
        <div className="font-semibold">{t('How to vote on proposals')}</div>
        <p className="text-muted-foreground">
          {t(
            'React with a 👍 on an existing GitHub issue. Proposals with enough votes are built automatically.'
          )}
        </p>
      </div>
      <div>
        <a
          href={REPO_ISSUES_URL}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          {t('Open GitHub issues')}
        </a>
      </div>
    </div>
  )

  if (isSmallScreen) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('Welcome to Jumble Ouro')}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">{body}</div>
          <div className="px-4 pb-6">
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              {t("Let's go")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Welcome to Jumble Ouro')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('Welcome to Jumble Ouro')}
          </DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>{t("Let's go")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
