import SearchInput from '@/components/SearchInput'
import { useSearchProfiles } from '@/hooks'
import { toExternalContent, toNote } from '@/lib/link'
import { formatFeedRequest, parseNakReqCommand } from '@/lib/nak-parser'
import { randomString } from '@/lib/random'
import { normalizeUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useSecondaryPage } from '@/PageManager'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import storage from '@/services/local-storage.service'
import modalManager from '@/services/modal-manager.service'
import { TSearchHistoryItem, TSearchParams } from '@/types'
import { Hash, MessageSquare, Notebook, Search, Server, Terminal, X } from 'lucide-react'
import { nip19 } from 'nostr-tools'
import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import UserItem, { UserItemSkeleton } from '../UserItem'

const SAVEABLE_SEARCH_TYPES = new Set(['notes', 'hashtag', 'relay', 'profiles', 'externalContent'])

const SearchBar = forwardRef<
  TSearchBarRef,
  {
    input: string
    setInput: (input: string) => void
    onSearch: (params: TSearchParams | null) => void
  }
>(({ input, setInput, onSearch }, ref) => {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { isSmallScreen } = useScreenSize()
  const [debouncedInput, setDebouncedInput] = useState(input)
  const isIdSearch = useMemo(() => {
    const search = debouncedInput.trim()
    if (!search) return false
    if (/^[0-9a-f]{64}$/.test(search)) return true
    const id = search.startsWith('nostr:') ? search.slice(6) : search
    return /^(npub1|nprofile1|note1|nevent1|naddr1)/.test(id)
  }, [debouncedInput])
  const { profiles, isFetching: isFetchingProfiles } = useSearchProfiles(
    isIdSearch ? '' : debouncedInput,
    5
  )
  const [searching, setSearching] = useState(false)
  const [displayList, setDisplayList] = useState(false)
  const [selectableOptions, setSelectableOptions] = useState<TSearchParams[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<TSearchHistoryItem[]>(
    storage.getSearchHistory()
  )
  const searchInputRef = useRef<HTMLInputElement>(null)
  const normalizedUrl = useMemo(() => {
    if (['w', 'ws', 'ws:', 'ws:/', 'wss', 'wss:', 'wss:/'].includes(input)) {
      return undefined
    }
    if (!input.includes('.')) {
      return undefined
    }
    try {
      return normalizeUrl(input)
    } catch {
      return undefined
    }
  }, [input])
  const id = useMemo(() => `search-${randomString()}`, [])

  useImperativeHandle(ref, () => ({
    focus: () => {
      searchInputRef.current?.focus()
    },
    blur: () => {
      searchInputRef.current?.blur()
    }
  }))

  useEffect(() => {
    if (!input) {
      onSearch(null)
    }
    setSelectedIndex(-1)
  }, [input])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(input)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [input])

  const blur = () => {
    setSearching(false)
    searchInputRef.current?.blur()
  }

  const saveToHistory = (params: TSearchParams) => {
    if (!SAVEABLE_SEARCH_TYPES.has(params.type)) return
    const item: TSearchHistoryItem = {
      type: params.type,
      search: params.search,
      input: params.input ?? params.search
    }
    storage.addSearchHistoryItem(item)
    setSearchHistory(storage.getSearchHistory())
  }

  const updateSearch = (params: TSearchParams) => {
    saveToHistory(params)
    blur()

    if (params.type === 'note') {
      push(toNote(params.search))
    } else if (params.type === 'externalContent') {
      push(toExternalContent(params.search))
    } else {
      onSearch(params)
    }
  }

  const executeHistoryItem = (item: TSearchHistoryItem) => {
    const params: TSearchParams = {
      type: item.type as Exclude<TSearchParams['type'], 'nak'>,
      search: item.search,
      input: item.input
    }
    blur()

    if (params.type === 'externalContent') {
      push(toExternalContent(params.search))
    } else {
      onSearch(params)
    }
  }

  const removeHistoryItem = (index: number) => {
    storage.removeSearchHistoryItem(index)
    setSearchHistory(storage.getSearchHistory())
  }

  const clearHistory = () => {
    storage.clearSearchHistory()
    setSearchHistory([])
  }

  useEffect(() => {
    const search = input.trim()
    if (!search) return

    // Check if input is a nak req command
    const request = parseNakReqCommand(search)
    if (request) {
      setSelectableOptions([
        {
          type: 'nak',
          search: formatFeedRequest(request),
          request,
          input: search
        }
      ])
      return
    }

    if (/^[0-9a-f]{64}$/.test(search)) {
      setSelectableOptions([
        { type: 'note', search },
        { type: 'profile', search }
      ])
      return
    }

    try {
      let id = search
      if (id.startsWith('nostr:')) {
        id = id.slice(6)
      }
      const { type } = nip19.decode(id)
      if (['nprofile', 'npub'].includes(type)) {
        setSelectableOptions([{ type: 'profile', search: id }])
        return
      }
      if (['nevent', 'naddr', 'note'].includes(type)) {
        setSelectableOptions([{ type: 'note', search: id }])
        return
      }
    } catch {
      // ignore
    }

    const hashtag = search.match(/[\p{L}\p{N}\p{M}]+/u)?.[0].toLowerCase() ?? ''

    setSelectableOptions([
      { type: 'notes', search },
      ...(normalizedUrl ? [{ type: 'relay', search: normalizedUrl, input: normalizedUrl }] : []),
      { type: 'externalContent', search, input },
      { type: 'hashtag', search: hashtag, input: `#${hashtag}` },
      ...profiles.map((profile) => ({
        type: 'profile',
        search: profile.npub,
        input: profile.username
      })),
      ...(profiles.length >= 5 ? [{ type: 'profiles', search }] : [])
    ] as TSearchParams[])
  }, [input, debouncedInput, profiles])

  const historyList = useMemo(() => {
    if (searchHistory.length <= 0) return null

    return (
      <>
        {searchHistory.map((item, index) => (
          <HistoryItem
            key={`${item.type}-${item.search}`}
            item={item}
            selected={selectedIndex === index}
            onClick={() => executeHistoryItem(item)}
            onRemove={(e) => {
              e.stopPropagation()
              e.preventDefault()
              removeHistoryItem(index)
            }}
          />
        ))}
        <div
          className="cursor-pointer px-3 py-1.5 text-center text-sm text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearHistory}
        >
          {t('Clear all')}
        </div>
      </>
    )
  }, [searchHistory, selectedIndex, t])

  const list = useMemo(() => {
    if (selectableOptions.length <= 0) {
      return null
    }

    return (
      <>
        {selectableOptions.map((option, index) => {
          if (option.type === 'note') {
            return (
              <NoteItem
                key={index}
                selected={selectedIndex === index}
                id={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'profile') {
            return (
              <ProfileItem
                key={index}
                selected={selectedIndex === index}
                userId={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'notes') {
            return (
              <NormalItem
                key={index}
                selected={selectedIndex === index}
                search={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'hashtag') {
            return (
              <HashtagItem
                key={index}
                selected={selectedIndex === index}
                hashtag={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'relay') {
            return (
              <RelayItem
                key={index}
                selected={selectedIndex === index}
                url={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'externalContent') {
            return (
              <ExternalContentItem
                key={index}
                selected={selectedIndex === index}
                search={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'nak') {
            return (
              <NakItem
                key={index}
                selected={selectedIndex === index}
                description={option.search}
                onClick={() => updateSearch(option)}
              />
            )
          }
          if (option.type === 'profiles') {
            return (
              <Item
                key={index}
                selected={selectedIndex === index}
                onClick={() => updateSearch(option)}
              >
                <div className="font-semibold">{t('Show more...')}</div>
              </Item>
            )
          }
          return null
        })}
        {isFetchingProfiles && profiles.length < 5 && (
          <div className="px-2">
            <UserItemSkeleton hideFollowButton />
          </div>
        )}
      </>
    )
  }, [selectableOptions, selectedIndex, isFetchingProfiles, profiles])

  const showingHistory = searching && !input && !!historyList
  const showingSuggestions = searching && !!input && !!list

  useEffect(() => {
    setDisplayList(showingHistory || showingSuggestions)
  }, [showingHistory, showingSuggestions])

  useEffect(() => {
    if (displayList) {
      modalManager.register(id, () => {
        setDisplayList(false)
      })
    } else {
      modalManager.unregister(id)
    }
  }, [displayList])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showingHistory) {
        if (e.key === 'Enter') {
          e.stopPropagation()
          if (searchHistory.length <= 0) return
          const idx = selectedIndex >= 0 ? selectedIndex : 0
          if (idx < searchHistory.length) {
            executeHistoryItem(searchHistory[idx])
          }
          return
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault()
          if (searchHistory.length <= 0) return
          setSelectedIndex((prev) => (prev + 1) % searchHistory.length)
          return
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault()
          if (searchHistory.length <= 0) return
          setSelectedIndex((prev) => (prev - 1 + searchHistory.length) % searchHistory.length)
          return
        }

        if (e.key === 'Escape') {
          blur()
          return
        }
        return
      }

      if (e.key === 'Enter') {
        e.stopPropagation()
        if (selectableOptions.length <= 0) {
          return
        }
        onSearch(selectableOptions[selectedIndex >= 0 ? selectedIndex : 0])
        blur()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (selectableOptions.length <= 0) {
          return
        }
        setSelectedIndex((prev) => (prev + 1) % selectableOptions.length)
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (selectableOptions.length <= 0) {
          return
        }
        setSelectedIndex((prev) => (prev - 1 + selectableOptions.length) % selectableOptions.length)
        return
      }

      if (e.key === 'Escape') {
        blur()
        return
      }
    },
    [input, onSearch, selectableOptions, selectedIndex, showingHistory, searchHistory]
  )

  const activeDropdown = showingHistory ? historyList : showingSuggestions ? list : null

  return (
    <div className="relative flex h-full w-full items-center gap-1">
      {displayList && activeDropdown && (
        <>
          <div
            className={cn(
              'z-50 rounded-b-lg bg-surface-background shadow-lg',
              isSmallScreen
                ? 'fixed inset-x-0 top-12'
                : 'absolute inset-x-0 top-full -translate-y-2 border px-1 pb-1 pt-3.5'
            )}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="h-fit">{activeDropdown}</div>
          </div>
          <div className="fixed inset-0 h-full w-full" onClick={() => blur()} />
        </>
      )}
      <SearchInput
        ref={searchInputRef}
        className={cn(
          'h-full border-transparent bg-surface-background shadow-inner',
          searching ? 'z-50' : ''
        )}
        placeholder={t('People, keywords, or relays')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setSearching(true)}
        onBlur={() => setSearching(false)}
      />
    </div>
  )
})
SearchBar.displayName = 'SearchBar'
export default SearchBar

export type TSearchBarRef = {
  focus: () => void
  blur: () => void
}

const HISTORY_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  notes: Search,
  hashtag: Hash,
  relay: Server,
  profiles: Search,
  externalContent: MessageSquare
}

function HistoryItem({
  item,
  onClick,
  onRemove,
  selected
}: {
  item: TSearchHistoryItem
  onClick?: () => void
  onRemove?: (e: React.MouseEvent) => void
  selected?: boolean
}) {
  const { t } = useTranslation()
  const Icon = HISTORY_TYPE_ICONS[item.type] ?? Search
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <Icon className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-semibold">{item.input}</div>
        <div className="text-sm text-muted-foreground">{t('Recent search')}</div>
      </div>
      <button
        className="flex size-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRemove}
      >
        <X size={16} />
      </button>
    </Item>
  )
}

function NormalItem({
  search,
  onClick,
  selected
}: {
  search: string
  onClick?: () => void
  selected?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <Search className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-semibold">{search}</div>
        <div className="text-sm text-muted-foreground">{t('Search for notes')}</div>
      </div>
    </Item>
  )
}

function HashtagItem({
  hashtag,
  onClick,
  selected
}: {
  hashtag: string
  onClick?: () => void
  selected?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <Hash className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-semibold">#{hashtag}</div>
        <div className="text-sm text-muted-foreground">{t('Search for hashtag')}</div>
      </div>
    </Item>
  )
}

function NoteItem({
  id,
  onClick,
  selected
}: {
  id: string
  onClick?: () => void
  selected?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <Notebook className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-mono text-sm font-semibold">{id}</div>
        <div className="text-sm text-muted-foreground">{t('Go to note')}</div>
      </div>
    </Item>
  )
}

function ProfileItem({
  userId,
  onClick,
  selected
}: {
  userId: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <div
      className={cn('cursor-pointer rounded-md px-2 hover:bg-accent', selected && 'bg-accent')}
      onClick={onClick}
    >
      <UserItem
        userId={userId}
        className="pointer-events-none"
        hideFollowButton
        showFollowingBadge
      />
    </div>
  )
}

function RelayItem({
  url,
  onClick,
  selected
}: {
  url: string
  onClick?: () => void
  selected?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <Server className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-semibold">{url}</div>
        <div className="text-sm text-muted-foreground">{t('Go to relay')}</div>
      </div>
    </Item>
  )
}

function ExternalContentItem({
  search,
  onClick,
  selected
}: {
  search: string
  onClick?: () => void
  selected?: boolean
}) {
  const { t } = useTranslation()
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <MessageSquare className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-semibold">{search}</div>
        <div className="text-sm text-muted-foreground">{t('View discussions about this')}</div>
      </div>
    </Item>
  )
}

function NakItem({
  description,
  onClick,
  selected
}: {
  description: string
  onClick?: () => void
  selected?: boolean
}) {
  return (
    <Item onClick={onClick} selected={selected}>
      <div className="flex size-10 items-center justify-center">
        <Terminal className="flex-shrink-0 text-muted-foreground" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate font-semibold">REQ</div>
        <div className="truncate text-sm text-muted-foreground">{description}</div>
      </div>
    </Item>
  )
}

function Item({
  className,
  children,
  selected,
  ...props
}: HTMLAttributes<HTMLDivElement> & { selected?: boolean }) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent',
        selected ? 'bg-accent' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
