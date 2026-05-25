import { Favicon } from '@/components/Favicon'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetchWebMetadata } from '@/hooks/useFetchWebMetadata'
import { isInsecureUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import { useMemo } from 'react'
import ExternalLink from '../ExternalLink'
import Image from '../Image'

export default function WebPreview({
  url,
  className,
  mustLoad
}: {
  url: string
  className?: string
  mustLoad?: boolean
}) {
  const { autoLoadMedia } = useContentPolicy()
  const { allowInsecureConnection } = useUserPreferences()
  const { isSmallScreen } = useScreenSize()
  const { title, description, image, loading } = useFetchWebMetadata(url)

  const hostname = useMemo(() => {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  }, [url])

  if (!allowInsecureConnection && isInsecureUrl(url)) {
    return null
  }

  if (!autoLoadMedia && !mustLoad) {
    return null
  }

  if (!title) {
    if (loading) {
      if (isSmallScreen) {
        return (
          <div className="mt-2 overflow-hidden rounded-xl border">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="w-full bg-muted p-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>
          </div>
        )
      }
      return (
        <div
          className={cn(
            'flex w-full overflow-hidden rounded-xl border p-0',
            className
          )}
        >
          <Skeleton className="h-28 w-28 shrink-0 rounded-none xl:w-36" />
          <div className="w-0 flex-1 p-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-1 h-4 w-3/4" />
            <Skeleton className="mt-1 h-3 w-full" />
          </div>
        </div>
      )
    }
    if (mustLoad) {
      return <ExternalLink url={url} justOpenLink />
    }
    return null
  }

  if (isSmallScreen && image) {
    return (
      <div
        className="mt-2 overflow-hidden rounded-xl border"
        onClick={(e) => {
          e.stopPropagation()
          window.open(url, '_blank')
        }}
      >
        <Image
          image={{ url: image }}
          className="h-44 w-full"
          classNames={{
            wrapper: 'rounded-none'
          }}
          hideIfError
        />
        <div className="w-full bg-muted p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Favicon domain={hostname} className="size-4 rounded-sm" />
            <span>{hostname}</span>
          </div>
          <div className="line-clamp-1 font-semibold">{title}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('clickable flex w-full overflow-hidden rounded-xl border p-0', className)}
      onClick={(e) => {
        e.stopPropagation()
        window.open(url, '_blank')
      }}
    >
      {image && (
        <Image
          image={{ url: image }}
          className="aspect-[4/3] h-44 bg-foreground xl:aspect-video"
          classNames={{
            wrapper: 'rounded-none border-r'
          }}
          hideIfError
        />
      )}
      <div className="w-0 flex-1 p-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Favicon domain={hostname} className="size-4 rounded-sm" />
          <span>{hostname}</span>
        </div>
        <div className="line-clamp-2 font-semibold">{title}</div>
        <div className="line-clamp-5 text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}
