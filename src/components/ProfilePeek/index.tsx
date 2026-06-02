import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { LONG_PRESS_THRESHOLD } from '@/constants'
import { toProfile } from '@/lib/link'
import { useSecondaryPage } from '@/PageManager'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProfileCard from '../ProfileCard'

export default function ProfilePeek({
  userId,
  children
}: {
  userId: string
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const [open, setOpen] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)

  const handleTouchStart = useCallback(() => {
    isLongPressRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      setOpen(true)
    }, LONG_PRESS_THRESHOLD)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleTouchMove = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.stopPropagation()
      e.preventDefault()
      isLongPressRef.current = false
    }
  }, [])

  const handleContextMenu = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const handleViewFullProfile = useCallback(() => {
    setOpen(false)
    push(toProfile(userId))
  }, [push, userId])

  return (
    <>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onClickCapture={handleClickCapture}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <div className="px-4 pb-4">
            <ProfileCard userId={userId} />
            <button
              className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
              onClick={handleViewFullProfile}
            >
              {t('View full profile')}
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
