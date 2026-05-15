import UnreadBadge from '@/components/UnreadBadge'
import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { Bell } from 'lucide-react'
import BottomNavigationBarItem from './BottomNavigationBarItem'

export default function NotificationsButton() {
  const { checkLogin } = useNostr()
  const { navigate, current, display } = usePrimaryPage()
  const { newNotificationCount } = useNotification()

  return (
    <BottomNavigationBarItem
      active={current === 'notifications' && display}
      onClick={() => checkLogin(() => navigate('notifications'))}
    >
      <div className="relative">
        <Bell />
        <UnreadBadge count={newNotificationCount} />
      </div>
    </BottomNavigationBarItem>
  )
}
