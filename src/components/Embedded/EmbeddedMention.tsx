import { cn } from '@/lib/utils'
import Username, { SimpleUsername } from '../Username'

export function EmbeddedMention({ userId, className }: { userId: string; className?: string }) {
  return (
    <Username
      userId={userId}
      showAt
      className={cn('inline font-normal text-primary', className)}
      withoutSkeleton
    />
  )
}

export function EmbeddedMentionText({ userId, className }: { userId: string; className?: string }) {
  return (
    <SimpleUsername userId={userId} showAt className={cn('inline', className)} withoutSkeleton />
  )
}
