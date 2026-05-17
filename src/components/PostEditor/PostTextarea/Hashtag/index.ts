import TTMention from '@tiptap/extension-mention'
import { ReactNodeViewRenderer } from '@tiptap/react'
import HashtagNode from './HashtagNode'

const Hashtag = TTMention.extend({
  name: 'hashtag',

  selectable: true,

  addNodeView() {
    return ReactNodeViewRenderer(HashtagNode)
  }
})

export default Hashtag
