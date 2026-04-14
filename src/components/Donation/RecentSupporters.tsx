import { formatAmount } from '@/lib/lightning'
import lightning, { TRecentSupporter } from '@/services/lightning.service'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function RecentSupporters() {
  const { t } = useTranslation()
  const [supporters, setSupporters] = useState<TRecentSupporter[]>([])

  useEffect(() => {
    const init = async () => {
      const items = await lightning.fetchRecentSupporters()
      setSupporters(items)
    }
    init()
  }, [])

  if (!supporters.length) return null

  return (
    <div className="space-y-2">
      <div className="text-center font-semibold">{t('Recent Supporters')}</div>
      <div className="flex flex-col gap-2">
        {supporters.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 rounded-md border p-2 sm:p-4"
          >
            <div className="flex w-0 flex-1 items-center gap-2">
              <UserAvatar userId={item.pubkey} />
              <div className="w-0 flex-1">
                <Username className="w-fit font-semibold" userId={item.pubkey} />
                <div className="line-clamp-3 select-text text-xs text-muted-foreground">
                  {item.comment}
                </div>
              </div>
            </div>
            <div className="shrink-0 font-semibold text-yellow-400">
              {formatAmount(item.amount)} {t('sats')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
