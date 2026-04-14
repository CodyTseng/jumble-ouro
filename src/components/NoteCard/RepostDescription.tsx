import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { Repeat2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

/**
 * - reposters.length === 1: show "Alice reposted"
 * - reposters.length === 2: show "Alice, Bob reposted"
 * - reposters.length === 3: show "Alice, Bob, Charlie reposted"
 * - reposters.length > 3: show "Alice, Bob, and x others reposted" (with hover card showing avatars of others)
 */
export default function RepostDescription({
  reposters,
  className
}: {
  reposters?: string[]
  className?: string
}) {
  const { t } = useTranslation()
  if (!reposters?.length) return null

  return (
    <div className={cn('mb-1 flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <Repeat2 size={16} className="shrink-0" />
      <Username
        key={reposters[0]}
        userId={reposters[0]}
        className={cn('truncate font-semibold', reposters.length > 1 && 'after:content-[","]')}
        skeletonClassName="h-3"
      />
      {reposters.length > 1 && (
        <Username
          key={reposters[1]}
          userId={reposters[1]}
          className={cn('truncate font-semibold', reposters.length === 3 && 'after:content-[","]')}
          skeletonClassName="h-3"
        />
      )}
      {reposters.length > 3 ? (
        <AndXOthers reposters={reposters.slice(2)} />
      ) : reposters.length === 3 ? (
        <Username
          key={reposters[2]}
          userId={reposters[2]}
          className={cn('truncate font-semibold')}
          skeletonClassName="h-3"
        />
      ) : null}
      <div className="shrink-0">{t('reposted')}</div>
    </div>
  )
}

function AndXOthers({ reposters }: { reposters: string[] }) {
  const { t } = useTranslation()

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="shrink-0 hover:underline">
          {t('and {{x}} others', { x: reposters.length })}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-fit max-w-60 flex-wrap p-2">
        {reposters.map((pubkey) => (
          <div key={pubkey} className="p-2">
            <UserAvatar key={pubkey} userId={pubkey} size="small" />
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  )
}
