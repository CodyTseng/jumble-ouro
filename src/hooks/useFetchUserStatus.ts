import client from '@/services/client.service'
import { TEmoji } from '@/types'
import { Event } from 'nostr-tools'
import { useEffect, useState } from 'react'

export type TUserStatus = {
  content: string
  url?: string
  emojis: TEmoji[]
}

function parseStatusEvent(event: Event | null): TUserStatus | null {
  if (!event || !event.content.trim()) return null

  const expirationTag = event.tags.find((t) => t[0] === 'expiration')
  if (expirationTag && expirationTag[1]) {
    const expiry = parseInt(expirationTag[1], 10)
    if (!isNaN(expiry) && expiry < Math.floor(Date.now() / 1000)) return null
  }

  const rTag = event.tags.find((t) => t[0] === 'r' && t[1])
  const emojis: TEmoji[] = event.tags
    .filter((t) => t[0] === 'emoji' && t[1] && t[2])
    .map((t) => ({ shortcode: t[1], url: t[2] }))

  return {
    content: event.content,
    url: rTag?.[1],
    emojis
  }
}

export function useFetchUserStatus(pubkey?: string | null) {
  const [generalStatus, setGeneralStatus] = useState<TUserStatus | null>(null)
  const [musicStatus, setMusicStatus] = useState<TUserStatus | null>(null)

  useEffect(() => {
    if (!pubkey) return

    const init = async () => {
      const { general, music } = await client.fetchUserStatus(pubkey)
      setGeneralStatus(parseStatusEvent(general))
      setMusicStatus(parseStatusEvent(music))
    }

    init()
  }, [pubkey])

  return { generalStatus, musicStatus }
}
