import ClientSelect from '@/components/ClientSelect'
import { useTranslation } from 'react-i18next'

export default function NotFound({ bech32Id }: { bech32Id?: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <div>{t('Note not found')}</div>
      <ClientSelect originalNoteId={bech32Id} />
    </div>
  )
}
