import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NsfwNote({
  show,
  reason = null
}: {
  show: () => void
  reason?: string | null
}) {
  const { t } = useTranslation()

  let label: string
  if (reason === null || reason.trim().toLowerCase() === 'nsfw') {
    label = t('🔞 NSFW 🔞')
  } else if (!reason.trim()) {
    label = t('⚠️ Content Warning')
  } else {
    label = t('⚠️ Content Warning: {{reason}}', { reason: reason.trim() })
  }

  return (
    <div className="my-4 flex flex-col items-center gap-2 font-medium text-muted-foreground">
      <div>{label}</div>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          show()
        }}
        variant="outline"
      >
        <Eye />
        {t('Temporarily display this note')}
      </Button>
    </div>
  )
}
