import { LRUCache } from 'lru-cache'
import { isValidPubkey } from './pubkey'

const NIP05_REGEX = /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i

export function isNip05Address(input: string): boolean {
  return NIP05_REGEX.test(input)
}

const NIP05_NOT_FOUND = ''
const resolveNip05Cache = new LRUCache<string, string>({ max: 500 })

export async function resolveNip05(address: string): Promise<string | null> {
  const cached = resolveNip05Cache.get(address)
  if (cached !== undefined) return cached || null

  const [name, domain] = address.split('@')
  if (!name || !domain) return null

  try {
    const res = await fetch(getWellKnownNip05Url(domain, name))
    const json = await res.json()
    const pubkey = json.names?.[name]
    if (typeof pubkey === 'string' && isValidPubkey(pubkey)) {
      resolveNip05Cache.set(address, pubkey)
      return pubkey
    }
  } catch {
    // ignore
  }
  resolveNip05Cache.set(address, NIP05_NOT_FOUND)
  return null
}

type TVerifyNip05Result = {
  isVerified: boolean
  nip05Name: string
  nip05Domain: string
}

const verifyNip05ResultCache = new LRUCache<string, TVerifyNip05Result>({
  max: 1000,
  fetchMethod: (key) => {
    const { nip05, pubkey } = JSON.parse(key)
    return _verifyNip05(nip05, pubkey)
  }
})

async function _verifyNip05(nip05: string, pubkey: string): Promise<TVerifyNip05Result> {
  const [nip05Name, nip05Domain] = nip05?.split('@') || [undefined, undefined]
  const result = { isVerified: false, nip05Name, nip05Domain }
  if (!nip05Name || !nip05Domain || !pubkey) return result

  try {
    const res = await fetch(getWellKnownNip05Url(nip05Domain, nip05Name))
    const json = await res.json()
    if (json.names?.[nip05Name] === pubkey) {
      return { ...result, isVerified: true }
    }
  } catch {
    // ignore
  }
  return result
}

export async function verifyNip05(nip05: string, pubkey: string): Promise<TVerifyNip05Result> {
  const result = await verifyNip05ResultCache.fetch(JSON.stringify({ nip05, pubkey }))
  if (result) {
    return result
  }
  const [nip05Name, nip05Domain] = nip05?.split('@') || [undefined, undefined]
  return { isVerified: false, nip05Name, nip05Domain }
}

export function getWellKnownNip05Url(domain: string, name?: string): string {
  const url = new URL('/.well-known/nostr.json', `https://${domain}`)
  if (name) {
    url.searchParams.set('name', name)
  }
  return url.toString()
}

export async function fetchPubkeysFromDomain(domain: string): Promise<string[]> {
  try {
    const res = await fetch(getWellKnownNip05Url(domain))
    const json = await res.json()
    const pubkeySet = new Set<string>()
    return Object.values(json.names || {}).filter((pubkey) => {
      if (typeof pubkey !== 'string' || !isValidPubkey(pubkey)) {
        return false
      }
      if (pubkeySet.has(pubkey)) {
        return false
      }
      pubkeySet.add(pubkey)
      return true
    }) as string[]
  } catch (error) {
    console.error('Error fetching pubkeys from domain:', error)
    return []
  }
}
