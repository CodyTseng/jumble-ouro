import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Collapsible({
  alwaysExpand = false,
  children,
  className,
  threshold = 1000,
  collapsedHeight = 600,
  ...props
}: {
  alwaysExpand?: boolean
  threshold?: number
  collapsedHeight?: number
} & React.HTMLProps<HTMLDivElement>) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [shouldCollapse, setShouldCollapse] = useState(false)
  const [animatingHeight, setAnimatingHeight] = useState<number | null>(null)

  useEffect(() => {
    if (alwaysExpand || shouldCollapse) return

    const contentEl = containerRef.current
    if (!contentEl) return

    const checkHeight = () => {
      const fullHeight = contentEl.scrollHeight
      if (fullHeight > threshold) {
        setShouldCollapse(true)
      }
    }

    checkHeight()

    const observer = new ResizeObserver(() => {
      checkHeight()
    })

    observer.observe(contentEl)

    return () => {
      observer.disconnect()
    }
  }, [alwaysExpand, shouldCollapse])

  useEffect(() => {
    if (animatingHeight === null) return

    const timer = setTimeout(() => {
      setExpanded(true)
      setAnimatingHeight(null)
    }, 350)

    return () => clearTimeout(timer)
  }, [animatingHeight])

  const maxHeight =
    animatingHeight !== null
      ? `${animatingHeight}px`
      : !shouldCollapse || expanded
        ? 'none'
        : `${collapsedHeight}px`

  return (
    <div
      className={cn('relative overflow-hidden text-left', className)}
      ref={containerRef}
      {...props}
      style={{
        maxHeight,
        transition: animatingHeight !== null ? 'max-height 300ms ease-out' : undefined
      }}
    >
      {children}
      {shouldCollapse && !expanded && (
        <div
          className="absolute bottom-0 z-10 flex h-40 w-full items-end justify-center bg-gradient-to-b from-transparent to-background/90 pb-4"
          style={{
            opacity: animatingHeight !== null ? 0 : 1,
            transition: animatingHeight !== null ? 'opacity 300ms ease-out' : undefined
          }}
        >
          <div className="rounded-lg bg-background">
            <Button
              className="bg-foreground hover:bg-foreground/80"
              onClick={(e) => {
                e.stopPropagation()
                if (containerRef.current) {
                  setAnimatingHeight(containerRef.current.scrollHeight)
                }
              }}
            >
              {t('Show more')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
