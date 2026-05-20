import { WAVLAKE_URL_REGEX } from '@/constants'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ExternalLink from '../ExternalLink'

export default function WavlakeEmbeddedPlayer({
  url,
  className,
  mustLoad = false
}: {
  url: string
  className?: string
  mustLoad?: boolean
}) {
  const { t } = useTranslation()
  const { autoLoadMedia } = useContentPolicy()
  const [display, setDisplay] = useState(autoLoadMedia || mustLoad)
  const parsed = useMemo(() => parseWavlakeUrl(url), [url])

  useEffect(() => {
    if (autoLoadMedia || mustLoad) {
      setDisplay(true)
    }
  }, [autoLoadMedia, mustLoad])

  if (!parsed) {
    return <ExternalLink url={url} />
  }

  if (!display) {
    return (
      <div
        className="w-fit cursor-pointer truncate text-primary hover:underline"
        onClick={(e) => {
          e.stopPropagation()
          setDisplay(true)
        }}
      >
        [{t('Click to load Wavlake')}]
      </div>
    )
  }

  const { type, id } = parsed
  const isCompact = type === 'track'
  const height = isCompact ? 152 : 352
  const embedUrl = `https://embed.wavlake.com/${type}/${id}`

  return (
    <iframe
      className={className}
      src={embedUrl}
      width="100%"
      height={height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style={{ borderRadius: 12, border: 0 }}
    />
  )
}

function parseWavlakeUrl(url: string): { type: string; id: string } | null {
  const match = url.match(WAVLAKE_URL_REGEX)
  if (!match) return null
  return { type: match[1].toLowerCase(), id: match[2] }
}
