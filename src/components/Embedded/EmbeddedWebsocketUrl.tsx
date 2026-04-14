import { useSecondaryPage } from '@/PageManager'
import { toRelay } from '@/lib/link'

export function EmbeddedWebsocketUrl({ url }: { url: string }) {
  const { push } = useSecondaryPage()
  return (
    <span
      className="cursor-pointer px-1 text-primary hover:bg-primary/20"
      onClick={(e) => {
        e.stopPropagation()
        push(toRelay(url))
      }}
    >
      [ {url} ]
      <span className="h-1 w-2 bg-primary" />
    </span>
  )
}
