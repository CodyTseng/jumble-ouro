import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { SuggestionKeyDownProps } from '@tiptap/suggestion'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export interface HashtagListProps {
  items: string[]
  command: (payload: { id: string; label?: string }) => void
}

export interface HashtagListHandle {
  onKeyDown: (args: SuggestionKeyDownProps) => boolean
}

const HashtagList = forwardRef<HashtagListHandle, HashtagListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command({ id: item, label: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(props.items.length ? 0 : -1)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter' && selectedIndex >= 0) {
        enterHandler()
        return true
      }

      return false
    }
  }))

  if (!props.items?.length) {
    return null
  }

  return (
    <ScrollArea
      className="pointer-events-auto z-50 flex max-h-80 flex-col overflow-y-auto rounded-lg border bg-background"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="p-1">
        {props.items.map((item, index) => (
          <button
            className={cn(
              'w-full cursor-pointer rounded-lg p-2 text-start text-sm transition-colors',
              selectedIndex === index && 'bg-accent text-accent-foreground'
            )}
            key={item}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className="pointer-events-none">#{item}</span>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
})
HashtagList.displayName = 'HashtagList'
export default HashtagList
