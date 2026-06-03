import { Button } from '@/components/ui/button'
import { Copy, Highlighter, Quote } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface HighlightButtonProps {
  onHighlight: (selectedText: string) => void
  onQuote?: (selectedText: string) => void
  containerRef?: React.RefObject<HTMLElement>
}

export default function HighlightButton({
  onHighlight,
  onQuote,
  containerRef
}: HighlightButtonProps) {
  const { t } = useTranslation()
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelectionEnd = () => {
      // Use a small delay to ensure selection is complete
      setTimeout(() => {
        const selection = window.getSelection()
        const text = selection?.toString().trim()

        if (!text || text.length === 0) {
          setPosition(null)
          setSelectedText('')
          return
        }

        // Check if selection is within the container (if provided)
        if (containerRef?.current) {
          const range = selection?.getRangeAt(0)
          if (range && !containerRef.current.contains(range.commonAncestorContainer)) {
            setPosition(null)
            setSelectedText('')
            return
          }
        }

        const range = selection?.getRangeAt(0)
        if (!range) return

        // Get the bounding rect of the entire selection
        const rect = range.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        // Position button above the selection area, centered horizontally
        setPosition({
          top: rect.top + scrollTop - 48, // 48px above the selection
          left: rect.left + scrollLeft + rect.width / 2 // Center of the selection
        })
        setSelectedText(text)
      }, 10)
    }

    // Only listen to mouseup and touchend (when user finishes selection)
    document.addEventListener('mouseup', handleSelectionEnd)
    document.addEventListener('touchend', handleSelectionEnd)

    return () => {
      document.removeEventListener('mouseup', handleSelectionEnd)
      document.removeEventListener('touchend', handleSelectionEnd)
    }
  }, [containerRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        const selection = window.getSelection()
        if (!selection?.toString().trim()) {
          setPosition(null)
          setSelectedText('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    setPosition(null)
    setSelectedText('')
  }

  if (!position || !selectedText) {
    return null
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 duration-200 animate-in fade-in-0 slide-in-from-bottom-4"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="-translate-x-1/2 flex items-center gap-0.5 rounded-lg bg-primary p-1 shadow-lg">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
          title={t('Copy')}
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard.writeText(selectedText)
            toast.success(t('Copied'))
            clearSelection()
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        {onQuote && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            title={t('Quote')}
            onClick={(e) => {
              e.stopPropagation()
              onQuote(selectedText)
              clearSelection()
            }}
          >
            <Quote className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
          title={t('Highlight')}
          onClick={(e) => {
            e.stopPropagation()
            onHighlight(selectedText)
            clearSelection()
          }}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
