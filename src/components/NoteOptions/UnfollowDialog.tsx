import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useFollowList } from '@/providers/FollowListProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from 'lucide-react'

export default function UnfollowDialog({
  pubkey,
  isOpen,
  onClose
}: {
  pubkey: string
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { unfollow } = useFollowList()
  const [updating, setUpdating] = useState(false)

  const handleUnfollow = async () => {
    setUpdating(true)
    try {
      await unfollow(pubkey)
    } finally {
      setUpdating(false)
      onClose()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Unfollow')}?</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Are you sure you want to unfollow this user?')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnfollow} variant="destructive" disabled={updating}>
            {updating ? <Loader className="animate-spin" /> : t('Unfollow')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
