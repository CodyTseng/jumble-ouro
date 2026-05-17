import { getHashtagHistory } from '@/lib/hashtag-history'
import { getTrendingHashtagsCache } from '@/lib/trending-hashtags-cache'
import postEditor from '@/services/post-editor.service'
import type { Editor } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { ReactRenderer } from '@tiptap/react'
import { SuggestionKeyDownProps } from '@tiptap/suggestion'
import tippy, { GetReferenceClientRect, Instance, Props } from 'tippy.js'
import HashtagList, { HashtagListHandle, HashtagListProps } from './HashtagList'

const HashtagPluginKey = new PluginKey('hashtag')

const suggestion = {
  char: '#',
  pluginKey: HashtagPluginKey,

  items: async ({ query }: { query: string }) => {
    const recent = getHashtagHistory()
    const trending = getTrendingHashtagsCache().map((h) => h.tag)

    const merged: string[] = []
    const seen = new Set<string>()
    for (const tag of [...recent, ...trending]) {
      const lower = tag.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        merged.push(lower)
      }
    }

    const q = query.toLowerCase()
    const filtered = q ? merged.filter((tag) => tag.startsWith(q)) : merged

    return filtered.slice(0, 8)
  },

  render: () => {
    let component: ReactRenderer<HashtagListHandle, HashtagListProps> | undefined
    let popup: Instance[] = []
    let touchListener: (e: TouchEvent) => void
    let closePopup: () => void

    return {
      onBeforeStart: () => {
        touchListener = (e: TouchEvent) => {
          if (popup && popup[0] && postEditor.isSuggestionPopupOpen) {
            const popupElement = popup[0].popper
            if (popupElement && !popupElement.contains(e.target as Node)) {
              popup[0].hide()
            }
          }
        }
        document.addEventListener('touchstart', touchListener)

        closePopup = () => {
          if (popup && popup[0]) {
            popup[0].hide()
          }
        }
        postEditor.addEventListener('closeSuggestionPopup', closePopup)
      },
      onStart: (props: { editor: Editor; clientRect?: (() => DOMRect | null) | null }) => {
        component = new ReactRenderer(HashtagList, {
          props,
          editor: props.editor
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          hideOnClick: true,
          touch: true,
          onShow() {
            postEditor.isSuggestionPopupOpen = true
          },
          onHide() {
            postEditor.isSuggestionPopupOpen = false
          }
        })
      },

      onUpdate(props: { clientRect?: (() => DOMRect | null) | null | undefined }) {
        component?.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0]?.setProps({
          getReferenceClientRect: props.clientRect
        } as Partial<Props>)
      },

      onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === 'Escape') {
          popup[0]?.hide()
          return true
        }
        return component?.ref?.onKeyDown(props) ?? false
      },

      onExit() {
        postEditor.isSuggestionPopupOpen = false
        popup[0]?.destroy()
        component?.destroy()

        document.removeEventListener('touchstart', touchListener)
        postEditor.removeEventListener('closeSuggestionPopup', closePopup)
      }
    }
  }
}

export default suggestion
