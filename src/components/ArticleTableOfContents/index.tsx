import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { List } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface TocHeading {
  id: string
  text: string
  level: number
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9À-ɏЀ-ӿ一-鿿぀-ゟ゠-ヿ가-힯-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = []
  const idCounts = new Map<string, number>()
  const lines = markdown.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`~[\]]/g, '').trim()
      const baseId = slugifyHeading(text)
      const count = idCounts.get(baseId) || 0
      const id = count === 0 ? baseId : `${baseId}-${count}`
      idCounts.set(baseId, count + 1)
      headings.push({ id, text, level })
    }
  }

  return headings
}

function getScrollableAncestor(el: HTMLElement): HTMLElement | null {
  let current = el.parentElement
  while (current) {
    const { overflow, overflowY } = getComputedStyle(current)
    if (/(auto|scroll)/.test(overflow + overflowY)) {
      return current
    }
    current = current.parentElement
  }
  return null
}

export default function ArticleTableOfContents({
  headings,
  contentRef
}: {
  headings: TocHeading[]
  contentRef: React.RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const scrollAncestor = getScrollableAncestor(container)
    const root = scrollAncestor || null

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        root,
        rootMargin: '-10% 0px -80% 0px'
      }
    )

    const headingElements = headings
      .map((h) => container.querySelector(`#${CSS.escape(h.id)}`))
      .filter(Boolean) as Element[]

    for (const el of headingElements) {
      observerRef.current.observe(el)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings, contentRef])

  const scrollToHeading = useCallback(
    (id: string) => {
      const container = contentRef.current
      if (!container) return

      const el = container.querySelector(`#${CSS.escape(id)}`)
      if (!el) return

      const scrollAncestor = getScrollableAncestor(container)
      if (scrollAncestor) {
        const containerRect = scrollAncestor.getBoundingClientRect()
        const elementRect = el.getBoundingClientRect()
        const offset = elementRect.top - containerRect.top + scrollAncestor.scrollTop - 60
        scrollAncestor.scrollTo({ top: offset, behavior: 'smooth' })
      } else {
        const elementRect = el.getBoundingClientRect()
        const offset = elementRect.top + window.scrollY - 60
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }

      setOpen(false)
    },
    [contentRef]
  )

  if (headings.length < 2) return null

  const headingList = (
    <div className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto">
      {headings.map((heading) => (
        <button
          key={heading.id}
          className={`rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
            activeId === heading.id ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground'
          }`}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 12}px` }}
          onClick={() => scrollToHeading(heading.id)}
        >
          {heading.text}
        </button>
      ))}
    </div>
  )

  if (isSmallScreen) {
    return (
      <>
        <Button
          variant="ghost"
          size="titlebar-icon"
          className="text-muted-foreground hover:text-foreground"
          title={t('Table of contents')}
          onClick={() => setOpen(true)}
        >
          <List size={20} />
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-4 pb-4">
            <DrawerHeader>
              <DrawerTitle>{t('Table of contents')}</DrawerTitle>
            </DrawerHeader>
            {headingList}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="titlebar-icon"
          className="text-muted-foreground hover:text-foreground"
          title={t('Table of contents')}
        >
          <List size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="end" sideOffset={0}>
        <div className="mb-2 px-3 text-xs font-medium text-muted-foreground">
          {t('Table of contents')}
        </div>
        {headingList}
      </PopoverContent>
    </Popover>
  )
}
