import { buildATag, buildETag, createBookmarkDraftEvent } from '@/lib/draft-event'
import { formatError } from '@/lib/error'
import { getReplaceableCoordinateFromEvent, isReplaceableEvent } from '@/lib/event'
import client from '@/services/client.service'
import { Event } from 'nostr-tools'
import { createContext, useContext } from 'react'
import { toast } from 'sonner'
import { useNostr } from './NostrProvider'

type TBookmarksContext = {
  addBookmark: (event: Event) => Promise<void>
  removeBookmark: (event: Event) => Promise<void>
}

const BookmarksContext = createContext<TBookmarksContext | undefined>(undefined)

export const useBookmarks = () => {
  const context = useContext(BookmarksContext)
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider')
  }
  return context
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { pubkey: accountPubkey, publish, updateBookmarkListEvent } = useNostr()

  const addBookmark = async (event: Event) => {
    if (!accountPubkey) return

    const bookmarkListEvent = await client.fetchBookmarkListEvent(accountPubkey)
    const currentTags = bookmarkListEvent?.tags || []
    const isReplaceable = isReplaceableEvent(event.kind)
    const eventKey = isReplaceable ? getReplaceableCoordinateFromEvent(event) : event.id

    if (
      currentTags.some((tag) =>
        isReplaceable
          ? tag[0] === 'a' && tag[1] === eventKey
          : tag[0] === 'e' && tag[1] === eventKey
      )
    ) {
      return
    }

    const newBookmarkDraftEvent = createBookmarkDraftEvent(
      [...currentTags, isReplaceable ? buildATag(event) : buildETag(event.id, event.pubkey)],
      bookmarkListEvent?.content
    )
    try {
      const newBookmarkEvent = await publish(newBookmarkDraftEvent)
      await updateBookmarkListEvent(newBookmarkEvent)
    } catch (error) {
      const errors = formatError(error)
      errors.forEach((err) => {
        toast.error(`Failed to add bookmark: ${err}`, { duration: 10_000 })
      })
    }
  }

  const removeBookmark = async (event: Event) => {
    if (!accountPubkey) return

    const bookmarkListEvent = await client.fetchBookmarkListEvent(accountPubkey)
    if (!bookmarkListEvent) return

    const isReplaceable = isReplaceableEvent(event.kind)
    const eventKey = isReplaceable ? getReplaceableCoordinateFromEvent(event) : event.id

    const newTags = bookmarkListEvent.tags.filter((tag) =>
      isReplaceable ? tag[0] !== 'a' || tag[1] !== eventKey : tag[0] !== 'e' || tag[1] !== eventKey
    )
    if (newTags.length === bookmarkListEvent.tags.length) return

    const newBookmarkDraftEvent = createBookmarkDraftEvent(newTags, bookmarkListEvent.content)
    try {
      const newBookmarkEvent = await publish(newBookmarkDraftEvent)
      await updateBookmarkListEvent(newBookmarkEvent)
    } catch (error) {
      const errors = formatError(error)
      errors.forEach((err) => {
        toast.error(`Failed to remove bookmark: ${err}`, { duration: 10_000 })
      })
    }
  }

  return (
    <BookmarksContext.Provider
      value={{
        addBookmark,
        removeBookmark
      }}
    >
      {children}
    </BookmarksContext.Provider>
  )
}
