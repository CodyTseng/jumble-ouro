import { useTranslation } from 'react-i18next'
import Image from '../Image'
import OpenSatsLogo from './open-sats-logo.svg'

export default function PlatinumSponsors() {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <div className="text-center font-semibold">{t('Platinum Sponsors')}</div>
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex cursor-pointer items-center gap-4"
          onClick={() => window.open('https://opensats.org/', '_blank')}
        >
          <Image
            image={{
              url: OpenSatsLogo
            }}
            className="h-11"
          />
          <div className="text-2xl font-semibold">OpenSats</div>
        </div>
      </div>
    </div>
  )
}
