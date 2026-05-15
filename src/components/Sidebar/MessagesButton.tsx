import UnreadBadge from '@/components/UnreadBadge'
import { useDmUnread } from '@/hooks/useDmUnread'
import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { MessageCircle } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function MessagesButton({ collapse }: { collapse: boolean }) {
  const { checkLogin } = useNostr()
  const { navigate, current, display } = usePrimaryPage()
  const { unreadCount } = useDmUnread()

  return (
    <SidebarItem
      title="Messages"
      onClick={() => checkLogin(() => navigate('dms'))}
      active={display && current === 'dms'}
      collapse={collapse}
    >
      <div className="relative">
        <MessageCircle />
        <UnreadBadge count={unreadCount} />
      </div>
    </SidebarItem>
  )
}
