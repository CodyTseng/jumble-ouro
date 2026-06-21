import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatSatsDisplay } from '@/components/ZapDialog'
import { useZap } from '@/providers/ZapProvider'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const DEFAULT_PRESETS_ZH = [21, 66, 210, 666, 1000, 2100, 6666, 10000, 21000, 66666, 100000, 210000]
const DEFAULT_PRESETS = [21, 42, 210, 420, 1000, 2100, 4200, 10000, 21000, 42000, 100000, 210000]

export default function CustomZapPresetsEditor() {
  const { t, i18n } = useTranslation()
  const { customZapPresets, updateCustomZapPresets } = useZap()
  const defaults = useMemo(
    () => (i18n.language.startsWith('zh') ? DEFAULT_PRESETS_ZH : DEFAULT_PRESETS),
    [i18n.language]
  )
  const currentPresets = customZapPresets ?? defaults
  const [inputs, setInputs] = useState<string[]>(currentPresets.map(String))
  const [dirty, setDirty] = useState(false)

  const handleInputChange = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setDirty(true)
  }

  const handleSave = () => {
    const parsed = inputs
      .map((v) => parseInt(v, 10))
      .map((n) => (isNaN(n) || n <= 0 ? 1 : n))
      .sort((a, b) => a - b)
    setInputs(parsed.map(String))
    updateCustomZapPresets(parsed)
    setDirty(false)
  }

  const handleReset = () => {
    updateCustomZapPresets(null)
    setInputs(defaults.map(String))
    setDirty(false)
  }

  return (
    <div className="w-full space-y-2">
      <Label>{t('Zap presets')}</Label>
      <div className="grid grid-cols-4 gap-2">
        {inputs.map((val, i) => (
          <div key={i} className="relative">
            <Input
              className="pr-10 text-right"
              value={val}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onBlur={() => {
                const num = parseInt(val, 10)
                if (isNaN(num) || num <= 0) {
                  handleInputChange(i, '1')
                }
              }}
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {formatSatsDisplay(parseInt(val, 10) || 0)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={!dirty}>
          {t('Save presets')}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} disabled={!customZapPresets}>
          {t('Reset to defaults')}
        </Button>
      </div>
    </div>
  )
}
