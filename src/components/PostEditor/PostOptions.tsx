import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { StorageKey } from '@/constants'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function PostOptions({
  posting,
  show,
  addClientTag,
  setAddClientTag,
  isNsfw,
  setIsNsfw,
  contentWarningReason,
  setContentWarningReason,
  minPow,
  setMinPow
}: {
  posting: boolean
  show: boolean
  addClientTag: boolean
  setAddClientTag: Dispatch<SetStateAction<boolean>>
  isNsfw: boolean
  setIsNsfw: Dispatch<SetStateAction<boolean>>
  contentWarningReason: string
  setContentWarningReason: Dispatch<SetStateAction<string>>
  minPow: number
  setMinPow: Dispatch<SetStateAction<number>>
}) {
  const { t } = useTranslation()

  useEffect(() => {
    setAddClientTag(window.localStorage.getItem(StorageKey.ADD_CLIENT_TAG) === 'true')
  }, [])

  if (!show) return null

  const onAddClientTagChange = (checked: boolean) => {
    setAddClientTag(checked)
    window.localStorage.setItem(StorageKey.ADD_CLIENT_TAG, checked.toString())
  }

  const onNsfwChange = (checked: boolean) => {
    setIsNsfw(checked)
    if (!checked) {
      setContentWarningReason('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="add-client-tag">{t('Add client tag')}</Label>
          <Switch
            id="add-client-tag"
            checked={addClientTag}
            onCheckedChange={onAddClientTagChange}
            disabled={posting}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {t('Show others this was sent via Jumble')}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="add-nsfw-tag">{t('Content Warning')}</Label>
          <Switch
            id="add-nsfw-tag"
            checked={isNsfw}
            onCheckedChange={onNsfwChange}
            disabled={posting}
          />
        </div>
        {isNsfw && (
          <Input
            value={contentWarningReason}
            onChange={(e) => setContentWarningReason(e.target.value)}
            placeholder={t('Reason (optional)')}
            disabled={posting}
            className="h-8 text-sm"
          />
        )}
      </div>

      <div className="grid gap-4 pb-4">
        <Label>{t('Proof of Work (difficulty {{minPow}})', { minPow })}</Label>
        <Slider
          defaultValue={[0]}
          value={[minPow]}
          onValueChange={([pow]) => setMinPow(pow)}
          max={28}
          step={1}
          disabled={posting}
        />
      </div>
    </div>
  )
}
