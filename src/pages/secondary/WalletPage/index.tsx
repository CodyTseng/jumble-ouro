import { useSecondaryPage } from '@/PageManager'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { toRizful } from '@/lib/link'
import { useZap } from '@/providers/ZapProvider'
import { disconnect, launchModal } from '@getalby/bitcoin-connect-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import DefaultZapAmountInput from './DefaultZapAmountInput'
import DefaultZapCommentInput from './DefaultZapCommentInput'
import LightningAddressInput from './LightningAddressInput'
import QuickZapSwitch from './QuickZapSwitch'

const WalletPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { isWalletConnected, walletInfo } = useZap()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Wallet')}>
      {isWalletConnected ? (
        <div className="space-y-4 px-4 pt-3">
          <div>
            {walletInfo?.node.alias && (
              <div className="mb-2">
                {t('Connected to')} <strong>{walletInfo.node.alias}</strong>
              </div>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">{t('Disconnect Wallet')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('You will not be able to send zaps to others.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => disconnect()}>
                    {t('Disconnect')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <DefaultZapAmountInput />
          <DefaultZapCommentInput />
          <QuickZapSwitch />
          <LightningAddressInput />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 pt-3">
          <Button className="bg-foreground hover:bg-foreground/90" onClick={() => push(toRizful())}>
            {t('Start with a Rizful Vault')}
          </Button>
          <Button
            variant="link"
            className="px-0 text-muted-foreground hover:text-foreground"
            onClick={() => {
              launchModal()
            }}
          >
            {t('or other wallets')}
          </Button>
        </div>
      )}
    </SecondaryPageLayout>
  )
})
WalletPage.displayName = 'WalletPage'
export default WalletPage
