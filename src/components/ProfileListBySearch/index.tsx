import { useInfiniteScroll } from '@/hooks'
import fayan from '@/services/fayan.service'
import { useCallback, useEffect, useState } from 'react'
import UserItem, { UserItemSkeleton } from '../UserItem'

const LIMIT = 50
const SHOW_COUNT = 20

export function ProfileListBySearch({ search }: { search: string }) {
  const [pubkeys, setPubkeys] = useState<string[]>([])

  useEffect(() => {
    setPubkeys([])
  }, [search])

  const handleLoadMore = useCallback(async () => {
    const profiles = await fayan.searchUsers(search, LIMIT, pubkeys.length)
    if (profiles.length === 0) {
      return false
    }
    const pubkeySet = new Set(pubkeys)
    const newPubkeys = [...pubkeys]
    profiles.forEach((profile) => {
      if (!pubkeySet.has(profile.pubkey)) {
        pubkeySet.add(profile.pubkey)
        newPubkeys.push(profile.pubkey)
      }
    })
    setPubkeys(newPubkeys)
    return profiles.length >= LIMIT
  }, [search, pubkeys])

  const { visibleItems, shouldShowLoadingIndicator, bottomRef } = useInfiniteScroll({
    items: pubkeys,
    showCount: SHOW_COUNT,
    onLoadMore: handleLoadMore
  })

  return (
    <div className="px-4">
      {visibleItems.map((pubkey, index) => (
        <UserItem key={`${index}-${pubkey}`} userId={pubkey} />
      ))}
      <div ref={bottomRef} />
      {shouldShowLoadingIndicator && <UserItemSkeleton />}
    </div>
  )
}
