import TextWithEmojis from '@/components/TextWithEmojis'
import { TUserStatus } from '@/hooks/useFetchUserStatus'
import { CircleDot, Music } from 'lucide-react'

function StatusLine({
  status,
  icon
}: {
  status: TUserStatus
  icon: React.ReactNode
}) {
  const content = (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <TextWithEmojis
        text={status.content}
        emojis={status.emojis.length > 0 ? status.emojis : undefined}
        className="truncate"
      />
    </div>
  )

  if (status.url) {
    return (
      <a
        href={status.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-fit max-w-full hover:underline"
      >
        {content}
      </a>
    )
  }

  return content
}

export default function UserStatus({
  generalStatus,
  musicStatus
}: {
  generalStatus: TUserStatus | null
  musicStatus: TUserStatus | null
}) {
  if (!generalStatus && !musicStatus) return null

  return (
    <div className="mt-0.5 space-y-0.5">
      {generalStatus && (
        <StatusLine
          status={generalStatus}
          icon={<CircleDot className="size-3.5" />}
        />
      )}
      {musicStatus && (
        <StatusLine
          status={musicStatus}
          icon={<Music className="size-3.5" />}
        />
      )}
    </div>
  )
}
