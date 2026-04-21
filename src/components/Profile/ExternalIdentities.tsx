import { TExternalIdentity } from '@/types'
import { ExternalLink } from 'lucide-react'

const PLATFORM_CONFIG: Record<
  string,
  {
    displayName: string
    profileUrl?: (identity: string) => string
    proofUrl?: (identity: string, proof: string) => string
  }
> = {
  github: {
    displayName: 'GitHub',
    profileUrl: (identity) => `https://github.com/${identity}`,
    proofUrl: (identity, proof) => `https://gist.github.com/${identity}/${proof}`
  },
  twitter: {
    displayName: 'Twitter',
    profileUrl: (identity) => `https://twitter.com/${identity}`,
    proofUrl: (identity, proof) => `https://twitter.com/${identity}/status/${proof}`
  },
  mastodon: {
    displayName: 'Mastodon',
    profileUrl: (identity) => {
      const parts = identity.split('@')
      if (parts.length === 2) {
        return `https://${parts[0]}/@${parts[1]}`
      }
      return undefined as unknown as string
    },
    proofUrl: (identity, proof) => {
      const parts = identity.split('@')
      if (parts.length === 2) {
        return `https://${parts[0]}/users/${parts[1]}/statuses/${proof}`
      }
      return undefined as unknown as string
    }
  },
  telegram: {
    displayName: 'Telegram',
    proofUrl: (_identity, proof) => `https://t.me/${proof}`
  }
}

function getDisplayName(platform: string): string {
  return PLATFORM_CONFIG[platform]?.displayName ?? platform
}

function getProfileUrl(platform: string, identity: string): string | undefined {
  return PLATFORM_CONFIG[platform]?.profileUrl?.(identity)
}

function getProofUrl(platform: string, identity: string, proof: string): string | undefined {
  return PLATFORM_CONFIG[platform]?.proofUrl?.(identity, proof)
}

export default function ExternalIdentities({
  identities
}: {
  identities?: TExternalIdentity[]
}) {
  if (!identities || identities.length === 0) return null

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {identities.map((identity, index) => (
        <IdentityChip key={`${identity.platform}-${identity.identity}-${index}`} {...identity} />
      ))}
    </div>
  )
}

function IdentityChip({ platform, identity, proof }: TExternalIdentity) {
  const displayName = getDisplayName(platform)
  const profileUrl = getProfileUrl(platform, identity)
  const proofUrl = proof ? getProofUrl(platform, identity, proof) : undefined

  const content = (
    <>
      <span className="font-medium">{displayName}</span>
      <span className="text-muted-foreground">:</span>
      <span className="max-w-32 truncate">{identity}</span>
      {proofUrl && (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-0.5 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-3" />
        </a>
      )}
    </>
  )

  if (profileUrl) {
    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground hover:bg-muted/80"
      >
        {content}
      </a>
    )
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
      {content}
    </span>
  )
}
