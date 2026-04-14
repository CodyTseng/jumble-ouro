import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { Bell } from 'lucide-react'
import BottomNavigationBarItem from './BottomNavigationBarItem'

export default function NotificationsButton() {
  const { checkLogin } = useNostr()
  const { navigate, current, display } = usePrimaryPage()
  const { hasNewNotification } = useNotification()

  return (
    <BottomNavigationBarItem
      active={current === 'notifications' && display}
      onClick={() => checkLogin(() => navigate('notifications'))}
    >
      <div className="relative">
        <Bell />
        {hasNewNotification && (
          <div className="absolute -top-0.5 right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </div>
    </BottomNavigationBarItem>
  )
}
