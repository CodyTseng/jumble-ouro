import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { Bell } from 'lucide-react'
import SidebarItem from './SidebarItem'

export default function NotificationsButton({ collapse }: { collapse: boolean }) {
  const { checkLogin } = useNostr()
  const { navigate, current, display } = usePrimaryPage()
  const { hasNewNotification } = useNotification()

  return (
    <SidebarItem
      title="Notifications"
      onClick={() => checkLogin(() => navigate('notifications'))}
      active={display && current === 'notifications'}
      collapse={collapse}
    >
      <div className="relative">
        <Bell />
        {hasNewNotification && (
          <div className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </div>
    </SidebarItem>
  )
}
