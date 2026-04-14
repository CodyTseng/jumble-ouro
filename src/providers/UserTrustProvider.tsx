import { SPECIAL_TRUST_SCORE_FILTER_ID } from '@/constants'
import client from '@/services/client.service'
import fayan from '@/services/fayan.service'
import storage from '@/services/local-storage.service'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNostr } from './NostrProvider'

type TUserTrustContext = {
  minTrustScore: number
  minTrustScoreMap: Record<string, number>
  getMinTrustScore: (id: string) => number
  updateMinTrustScore: (id: string, score: number) => void
  isUserTrusted: (pubkey: string) => boolean
  isSpammer: (pubkey: string) => Promise<boolean>
  meetsMinTrustScore: (pubkey: string, minScore: number) => Promise<boolean>
}

const UserTrustContext = createContext<TUserTrustContext | undefined>(undefined)

export const useUserTrust = () => {
  const context = useContext(UserTrustContext)
  if (!context) {
    throw new Error('useUserTrust must be used within a UserTrustProvider')
  }
  return context
}

const wotSet = new Set<string>()

export function UserTrustProvider({ children }: { children: React.ReactNode }) {
  const { pubkey: currentPubkey } = useNostr()
  const [minTrustScore, setMinTrustScore] = useState(() => storage.getMinTrustScore())
  const [minTrustScoreMap, setMinTrustScoreMap] = useState<Record<string, number>>(() =>
    storage.getMinTrustScoreMap()
  )

  useEffect(() => {
    if (!currentPubkey) return

    const initWoT = async () => {
      const followings = await client.fetchFollowings(currentPubkey, false)
      followings.forEach((pubkey) => wotSet.add(pubkey))

      const batchSize = 20
      for (let i = 0; i < followings.length; i += batchSize) {
        const batch = followings.slice(i, i + batchSize)
        await Promise.allSettled(
          batch.map(async (pubkey) => {
            const _followings = await client.fetchFollowings(pubkey, false)
            _followings.forEach((following) => {
              wotSet.add(following)
            })
          })
        )
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }
    initWoT()
  }, [currentPubkey])

  const isUserTrusted = useCallback(
    (pubkey: string) => {
      if (!currentPubkey || pubkey === currentPubkey) return true
      return wotSet.has(pubkey)
    },
    [currentPubkey]
  )

  const isSpammer = useCallback(
    async (pubkey: string) => {
      if (isUserTrusted(pubkey)) return false
      const percentile = await fayan.fetchUserPercentile(pubkey)
      if (percentile === null) return false
      return percentile < 60
    },
    [isUserTrusted]
  )

  const getMinTrustScore = useCallback(
    (id: string) => {
      return id === SPECIAL_TRUST_SCORE_FILTER_ID.DEFAULT
        ? minTrustScore
        : (minTrustScoreMap[id] ?? minTrustScore)
    },
    [minTrustScore, minTrustScoreMap]
  )

  const updateMinTrustScore = (id: string, score: number) => {
    if (score < 0 || score > 100) return

    if (id === SPECIAL_TRUST_SCORE_FILTER_ID.DEFAULT) {
      setMinTrustScore(score)
      storage.setMinTrustScore(score)
    } else {
      const newMap = { ...minTrustScoreMap, [id]: score }
      setMinTrustScoreMap(newMap)
      storage.setMinTrustScoreMap(newMap)
    }
  }

  const meetsMinTrustScore = useCallback(
    async (pubkey: string, minScore: number) => {
      if (minScore === 0) return true
      if (pubkey === currentPubkey) return true

      // WoT users always have 100% trust score
      if (wotSet.has(pubkey)) return true

      // Get percentile from reputation system
      const percentile = await fayan.fetchUserPercentile(pubkey)
      if (percentile === null) return true // If no data, indicate the trust server is down, so allow the user
      return percentile >= minScore
    },
    [currentPubkey]
  )

  return (
    <UserTrustContext.Provider
      value={{
        minTrustScore,
        minTrustScoreMap,
        getMinTrustScore,
        updateMinTrustScore,
        isUserTrusted,
        isSpammer,
        meetsMinTrustScore
      }}
    >
      {children}
    </UserTrustContext.Provider>
  )
}
