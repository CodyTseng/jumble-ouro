import { randomString } from '@/lib/random'
import { cn } from '@/lib/utils'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import modalManager from '@/services/modal-manager.service'
import { TImetaInfo } from '@/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Image from '../Image'

export default function ImageWithLightbox({
  image,
  className,
  classNames = {},
  errorPlaceholder,
  ignoreAutoLoadPolicy = false
}: {
  image: TImetaInfo
  className?: string
  classNames?: {
    wrapper?: string
    skeleton?: string
  }
  errorPlaceholder?: string
  ignoreAutoLoadPolicy?: boolean
}) {
  const id = useMemo(() => `image-with-lightbox-${randomString()}`, [])
  const { t } = useTranslation()
  const { autoLoadMedia } = useContentPolicy()
  const [display, setDisplay] = useState(ignoreAutoLoadPolicy ? true : autoLoadMedia)
  const [index, setIndex] = useState(-1)
  const handleDownload = useCallback(
    ({ slide, saveAs }: { slide: { src?: string }; saveAs: (source: Blob, name?: string) => void }) => {
      const url = slide.src
      if (!url) return
      const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'image')
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('fetch failed')
          return res.blob()
        })
        .then((blob) => {
          saveAs(blob, filename)
          toast.success(t('Image saved'))
        })
        .catch(() => {
          window.open(url, '_blank')
          toast.info(t('Image opened in new tab to save manually'))
        })
    },
    [t]
  )

  useEffect(() => {
    if (index >= 0) {
      modalManager.register(id, () => {
        setIndex(-1)
      })
    } else {
      modalManager.unregister(id)
    }
  }, [index])

  if (!display) {
    return (
      <div
        className="w-fit cursor-pointer truncate text-primary hover:underline"
        onClick={(e) => {
          e.stopPropagation()
          setDisplay(true)
        }}
      >
        [{t('Click to load image')}]
      </div>
    )
  }

  const handlePhotoClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    setIndex(0)
  }

  return (
    <div>
      <Image
        key={0}
        className={className}
        classNames={{
          wrapper: cn('border cursor-zoom-in', classNames.wrapper),
          errorPlaceholder: 'aspect-square h-[30vh]',
          skeleton: classNames.skeleton
        }}
        image={image}
        onClick={(e) => handlePhotoClick(e)}
        errorPlaceholder={errorPlaceholder}
      />
      {index >= 0 &&
        createPortal(
          <div onClick={(e) => e.stopPropagation()}>
            <Lightbox
              index={index}
              slides={[{ src: image.url, alt: image.alt }]}
              plugins={[Download, Zoom]}
              open={index >= 0}
              close={() => setIndex(-1)}
              download={{ download: handleDownload }}
              controller={{
                closeOnBackdropClick: true,
                closeOnPullUp: true,
                closeOnPullDown: true
              }}
              styles={{
                toolbar: { paddingTop: '2.25rem' }
              }}
            />
          </div>,
          document.body
        )}
    </div>
  )
}
