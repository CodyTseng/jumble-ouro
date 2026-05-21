import { cn } from '@/lib/utils'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ExternalLink from '../ExternalLink'
import Player from './Player'

export default function YoutubeEmbeddedPlayer({
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
  const [thumbnailError, setThumbnailError] = useState(false)
  const { videoId, isShort } = useMemo(() => parseYoutubeUrl(url), [url])

  useEffect(() => {
    if (autoLoadMedia || mustLoad) {
      setDisplay(true)
    }
  }, [autoLoadMedia, mustLoad])

  if (!videoId) {
    return <ExternalLink url={url} />
  }

  if (!display) {
    if (thumbnailError) {
      return (
        <div
          className="w-fit cursor-pointer truncate text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            setDisplay(true)
          }}
        >
          [{t('Click to load YouTube video')}]
        </div>
      )
    }

    return (
      <div
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-xl border',
          isShort ? 'aspect-[9/16] max-h-[80vh] sm:max-h-[60vh]' : 'aspect-video max-h-[60vh]',
          className
        )}
        onClick={(e) => {
          e.stopPropagation()
          setDisplay(true)
        }}
        role="button"
        aria-label={t('Click to load YouTube video')}
      >
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setThumbnailError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70">
            <svg viewBox="0 0 24 24" fill="white" className="ml-1 h-8 w-8">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return <Player videoId={videoId} isShort={isShort} className={className} />
}

function parseYoutubeUrl(url: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/
  ]

  let videoId: string | null = null
  let isShort = false
  for (const [index, pattern] of patterns.entries()) {
    const match = url.match(pattern)
    if (match) {
      videoId = match[1].trim()
      isShort = index === 2 // Check if it's a short video
      break
    }
  }
  return { videoId, isShort }
}
