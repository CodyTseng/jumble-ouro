import { Button } from '@/components/ui/button'
import { formatAmount, getInvoiceDetails } from '@/lib/lightning'
import { cn } from '@/lib/utils'
import { useNostr } from '@/providers/NostrProvider'
import lightning from '@/services/lightning.service'
import { CircleCheck, Clock, Loader, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

function formatTimeRemaining(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function EmbeddedLNInvoice({ invoice, className }: { invoice: string; className?: string }) {
  const { t } = useTranslation()
  const { checkLogin, pubkey } = useNostr()
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const { amount, description, expiryDate } = useMemo(() => {
    return getInvoiceDetails(invoice)
  }, [invoice])

  const isExpired = expiryDate ? expiryDate.getTime() <= now : false
  const timeRemaining = expiryDate ? expiryDate.getTime() - now : null
  const isSoonExpiring = timeRemaining !== null && timeRemaining > 0 && timeRemaining <= 3600000

  useEffect(() => {
    if (!expiryDate || isExpired) return
    if (!isSoonExpiring) return

    const interval = setInterval(() => {
      setNow(Date.now())
    }, 60000)

    return () => clearInterval(interval)
  }, [expiryDate, isExpired, isSoonExpiring])

  const handlePay = useCallback(async () => {
    try {
      if (!pubkey) {
        throw new Error('You need to be logged in to zap')
      }
      setPaying(true)
      const invoiceResult = await lightning.payInvoice(invoice)
      if (!invoiceResult) {
        return
      }
      setPaid(true)
    } catch (error) {
      toast.error(t('Lightning payment failed') + ': ' + (error as Error).message)
    } finally {
      setPaying(false)
    }
  }, [pubkey, invoice, t])

  const handlePayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    checkLogin(() => handlePay())
  }

  return (
    <div
      className={cn(
        'flex max-w-sm cursor-default flex-col gap-3 rounded-lg border p-3',
        isExpired && 'opacity-60',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-400" />
        <div className="text-sm font-semibold">{t('Lightning Invoice')}</div>
      </div>
      {description && (
        <div className="break-words text-sm text-muted-foreground">{description}</div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">
          {formatAmount(amount)} {t('sats')}
        </span>
        {expiryDate && isExpired && (
          <span className="text-sm font-medium text-destructive">{t('Expired')}</span>
        )}
        {expiryDate && !isExpired && timeRemaining !== null && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {t('Expires in {{time}}', { time: formatTimeRemaining(timeRemaining) })}
          </span>
        )}
      </div>
      {paid ? (
        <Button disabled variant="outline" className="text-green-600">
          <CircleCheck className="h-4 w-4" />
          {t('Paid')}
        </Button>
      ) : (
        <Button onClick={handlePayClick} disabled={isExpired || paying}>
          {paying && <Loader className="h-4 w-4 animate-spin" />}
          {t('Pay')}
        </Button>
      )}
    </div>
  )
}
