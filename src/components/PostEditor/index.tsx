import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertDialogContentUI,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import postEditor from '@/services/post-editor.service'
import { Event } from 'nostr-tools'
import { Dispatch, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PostContent from './PostContent'
import Title from './Title'

export default function PostEditor({
  defaultContent = '',
  parentStuff,
  open,
  setOpen,
  openFrom,
  highlightedText
}: {
  defaultContent?: string
  parentStuff?: Event | string
  open: boolean
  setOpen: Dispatch<boolean>
  openFrom?: string[]
  highlightedText?: string
}) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const isDirtyRef = useRef(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  const handleDirtyChange = useCallback((dirty: boolean) => {
    isDirtyRef.current = dirty
  }, [])

  const handleRequestClose = useCallback(() => {
    if (isDirtyRef.current) {
      setDiscardDialogOpen(true)
    } else {
      setOpen(false)
    }
  }, [setOpen])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleRequestClose()
      } else {
        setOpen(true)
      }
    },
    [handleRequestClose, setOpen]
  )

  const handleDiscard = useCallback(() => {
    setDiscardDialogOpen(false)
    setOpen(false)
  }, [setOpen])

  const content = useMemo(() => {
    return (
      <PostContent
        defaultContent={defaultContent}
        parentStuff={parentStuff}
        close={handleRequestClose}
        openFrom={openFrom}
        highlightedText={highlightedText}
        onDirtyChange={handleDirtyChange}
      />
    )
  }, [highlightedText])

  const discardConfirmation = isSmallScreen ? (
    <Drawer open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('Discard post?')}</DrawerTitle>
          <DrawerDescription>{t('Your draft will be lost if you discard it.')}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="outline" onClick={() => setDiscardDialogOpen(false)} className="w-full">
            {t('Keep editing')}
          </Button>
          <Button variant="destructive" onClick={handleDiscard} className="w-full">
            {t('Discard')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
      <AlertDialogContentUI>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Discard post?')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Your draft will be lost if you discard it.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('Keep editing')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDiscard}>
            {t('Discard')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContentUI>
    </AlertDialog>
  )

  if (isSmallScreen) {
    return (
      <>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            className="h-full w-full border-none p-0"
            side="bottom"
            hideClose
            onEscapeKeyDown={(e) => {
              if (postEditor.isSuggestionPopupOpen) {
                e.preventDefault()
                postEditor.closeSuggestionPopup()
              }
            }}
          >
            <ScrollArea className="h-full max-h-screen px-4">
              <div className="space-y-4 px-2 py-6">
                <SheetHeader>
                  <SheetTitle className="text-start">
                    {highlightedText ? t('Create Highlight') : <Title parentStuff={parentStuff} />}
                  </SheetTitle>
                  <SheetDescription className="hidden" />
                </SheetHeader>
                {content}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        {discardConfirmation}
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-2xl p-0"
          withoutClose
          onEscapeKeyDown={(e) => {
            if (postEditor.isSuggestionPopupOpen) {
              e.preventDefault()
              postEditor.closeSuggestionPopup()
            }
          }}
        >
          <ScrollArea className="h-full max-h-screen px-4">
            <div className="space-y-4 px-2 py-6">
              <DialogHeader>
                <DialogTitle>
                  {highlightedText ? t('Create Highlight') : <Title parentStuff={parentStuff} />}
                </DialogTitle>
                <DialogDescription className="hidden" />
              </DialogHeader>
              {content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      {discardConfirmation}
    </>
  )
}
