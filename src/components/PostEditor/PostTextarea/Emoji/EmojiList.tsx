import Emoji from '@/components/Emoji'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import customEmojiService from '@/services/custom-emoji.service'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'

export interface EmojiListProps {
  items: string[]
  command: (params: { name?: string }) => void
}

export interface EmojiListHandler {
  onKeyDown: (params: { event: KeyboardEvent }) => boolean
}

export const EmojiList = forwardRef<EmojiListHandler, EmojiListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number): void => {
    const item = props.items[index]

    if (item) {
      props.command({ name: item })
    }

    customEmojiService.updateSuggested(item)
  }

  const upHandler = (): void => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = (): void => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = (): void => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(props.items.length ? 0 : -1), [props.items])

  useImperativeHandle(ref, () => {
    return {
      onKeyDown: (x: { event: KeyboardEvent }): boolean => {
        if (x.event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (x.event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (x.event.key === 'Enter' && selectedIndex >= 0) {
          enterHandler()
          return true
        }

        return false
      }
    }
  }, [upHandler, downHandler, enterHandler])

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
        {props.items.map((item, index) => {
          return (
            <EmojiListItem
              key={item}
              id={item}
              selectedIndex={selectedIndex}
              index={index}
              selectItem={selectItem}
              setSelectedIndex={setSelectedIndex}
            />
          )
        })}
      </div>
    </ScrollArea>
  )
})

function EmojiListItem({
  id,
  selectedIndex,
  index,
  selectItem,
  setSelectedIndex
}: {
  id: string
  selectedIndex: number
  index: number
  selectItem: (index: number) => void
  setSelectedIndex: (index: number) => void
}) {
  const emoji = useMemo(() => customEmojiService.getEmojiById(id), [id])
  if (!emoji) return null

  return (
    <button
      className={cn(
        'w-full cursor-pointer rounded-lg p-1 transition-colors [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        selectedIndex === index && 'bg-accent text-accent-foreground'
      )}
      onClick={() => selectItem(index)}
      onMouseEnter={() => setSelectedIndex(index)}
    >
      <div className="pointer-events-none flex items-center gap-2 truncate">
        <Emoji
          emoji={emoji}
          classNames={{
            img: 'size-8 shrink-0 rounded-md',
            text: 'w-8 text-center shrink-0'
          }}
        />
        <span className="truncate">:{emoji.shortcode}:</span>
      </div>
    </button>
  )
}
