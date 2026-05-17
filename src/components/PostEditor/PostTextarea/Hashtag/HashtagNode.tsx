import { cn } from '@/lib/utils'
import { NodeViewRendererProps, NodeViewWrapper } from '@tiptap/react'

export default function HashtagNode(props: NodeViewRendererProps & { selected: boolean }) {
  return (
    <NodeViewWrapper
      className={cn('inline text-primary', props.selected ? 'rounded-sm bg-primary/20' : '')}
    >
      #{props.node.attrs.id}
    </NodeViewWrapper>
  )
}
