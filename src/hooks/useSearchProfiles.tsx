import { useFeed } from '@/providers/FeedProvider'
import fayan from '@/services/fayan.service'
import { TProfile } from '@/types'
import { useEffect, useState } from 'react'
import { useFetchRelayInfos } from './useFetchRelayInfos'

export function useSearchProfiles(search: string, limit: number) {
  const { relayUrls } = useFeed()
  const { searchableRelayUrls } = useFetchRelayInfos(relayUrls)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [profiles, setProfiles] = useState<TProfile[]>([])

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!search) {
        setProfiles([])
        return
      }

      setIsFetching(true)
      setProfiles([])
      try {
        const existingPubkeys = new Set<string>()
        const profiles: TProfile[] = []
        const fetchedProfiles = await fayan.searchUsers(search, limit)
        if (fetchedProfiles.length) {
          fetchedProfiles.forEach((profile) => {
            if (existingPubkeys.has(profile.pubkey)) {
              return
            }
            existingPubkeys.add(profile.pubkey)
            profiles.push(profile)
          })
          setProfiles([...profiles])
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfiles()
  }, [searchableRelayUrls, search, limit])

  return { isFetching, error, profiles }
}
