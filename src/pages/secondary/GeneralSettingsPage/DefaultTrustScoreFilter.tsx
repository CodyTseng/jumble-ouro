import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { SPECIAL_TRUST_SCORE_FILTER_ID } from '@/constants'
import { useUserTrust } from '@/providers/UserTrustProvider'
import { useTranslation } from 'react-i18next'
import SettingItem from './SettingItem'

export default function DefaultTrustScoreFilter() {
  const { t } = useTranslation()
  const { minTrustScore, updateMinTrustScore } = useUserTrust()

  return (
    <SettingItem className="flex-col items-start gap-2">
      <Label className="text-base font-normal">
        {t('Default trust score filter threshold ({{n}}%)', { n: minTrustScore })}
      </Label>
      <Slider
        value={[minTrustScore]}
        onValueChange={([value]) =>
          updateMinTrustScore(SPECIAL_TRUST_SCORE_FILTER_ID.DEFAULT, value)
        }
        min={0}
        max={100}
        step={5}
        className="w-full"
      />
    </SettingItem>
  )
}
