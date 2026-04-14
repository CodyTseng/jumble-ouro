import TextWithEmojis from '@/components/TextWithEmojis'
import { useFetchProfile } from '@/hooks'
import { formatUserId } from '@/lib/pubkey'
import { cn } from '@/lib/utils'
import { NodeViewRendererProps, NodeViewWrapper } from '@tiptap/react'

export default function MentionNode(props: NodeViewRendererProps & { selected: boolean }) {
  const { profile } = useFetchProfile(props.node.attrs.id)

  return (
    <NodeViewWrapper
      className={cn('inline text-primary', props.selected ? 'rounded-sm bg-primary/20' : '')}
    >
      {'@'}
      {profile ? (
        <TextWithEmojis text={profile.username} emojis={profile.emojis} emojiClassName="mb-1" />
      ) : (
        formatUserId(props.node.attrs.id)
      )}
    </NodeViewWrapper>
  )
}
