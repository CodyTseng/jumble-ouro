import { SPOTIFY_URL_REGEX } from '@/constants'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ExternalLink from '../ExternalLink'

export default function SpotifyEmbeddedPlayer({
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
  const { theme } = useTheme()
  const [display, setDisplay] = useState(autoLoadMedia || mustLoad)
  const parsed = useMemo(() => parseSpotifyUrl(url), [url])

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
        [{t('Click to load Spotify')}]
      </div>
    )
  }

  const { type, id } = parsed
  const isCompact = type === 'track' || type === 'episode'
  const height = isCompact ? 152 : 352
  const themeParam = theme === 'light' ? 1 : 0
  const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${themeParam}`

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

function parseSpotifyUrl(url: string): { type: string; id: string } | null {
  const match = url.match(SPOTIFY_URL_REGEX)
  if (!match) return null
  return { type: match[1].toLowerCase(), id: match[2] }
}
