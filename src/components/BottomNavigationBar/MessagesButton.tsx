import UnreadBadge from '@/components/UnreadBadge'
import { useDmUnread } from '@/hooks/useDmUnread'
import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { MessageCircle } from 'lucide-react'
import BottomNavigationBarItem from './BottomNavigationBarItem'

export default function MessagesButton() {
  const { checkLogin } = useNostr()
  const { navigate, current, display } = usePrimaryPage()
  const { unreadCount } = useDmUnread()

  return (
    <BottomNavigationBarItem
      active={current === 'dms' && display}
      onClick={() => checkLogin(() => navigate('dms'))}
    >
      <div className="relative">
        <MessageCircle />
        <UnreadBadge count={unreadCount} />
      </div>
    </BottomNavigationBarItem>
  )
}
