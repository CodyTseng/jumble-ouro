import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function NewMailboxRelayInput({
  saveNewMailboxRelay
}: {
  saveNewMailboxRelay: (url: string) => string | null
}) {
  const { t } = useTranslation()
  const [newRelayUrl, setNewRelayUrl] = useState('')
  const [newRelayUrlError, setNewRelayUrlError] = useState<string | null>(null)

  const save = () => {
    const error = saveNewMailboxRelay(newRelayUrl)
    if (error) {
      setNewRelayUrlError(error)
    } else {
      setNewRelayUrl('')
    }
  }

  const handleRelayUrlInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      save()
    }
  }

  const handleRelayUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRelayUrl(e.target.value)
    setNewRelayUrlError(null)
  }

  return (
    <div>
      <div className="flex gap-4">
        <Input
          className={newRelayUrlError ? 'border-destructive' : ''}
          placeholder={t('Add a new relay')}
          value={newRelayUrl}
          onKeyDown={handleRelayUrlInputKeyDown}
          onChange={handleRelayUrlInputChange}
          onBlur={save}
        />
        <Button onClick={save}>{t('Add')}</Button>
      </div>
      {newRelayUrlError && <div className="mt-1 text-xs text-destructive">{newRelayUrlError}</div>}
    </div>
  )
}
