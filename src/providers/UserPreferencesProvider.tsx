import { CONTENT_FONT_SIZE_VALUES } from '@/constants'
import storage from '@/services/local-storage.service'
import { TContentFontSize, TEmoji, TNotificationStyle, TTimestampFormat } from '@/types'
import { createContext, useContext, useEffect, useState } from 'react'
import { useScreenSize } from './ScreenSizeProvider'

type TUserPreferencesContext = {
  notificationListStyle: TNotificationStyle
  updateNotificationListStyle: (style: TNotificationStyle) => void

  muteMedia: boolean
  updateMuteMedia: (mute: boolean) => void

  sidebarCollapse: boolean
  updateSidebarCollapse: (collapse: boolean) => void

  enableSingleColumnLayout: boolean
  updateEnableSingleColumnLayout: (enable: boolean) => void

  quickReaction: boolean
  updateQuickReaction: (enable: boolean) => void

  quickReactionEmoji: string | TEmoji
  updateQuickReactionEmoji: (emoji: string | TEmoji) => void

  allowInsecureConnection: boolean
  updateAllowInsecureConnection: (allow: boolean) => void

  contentFontSize: TContentFontSize
  updateContentFontSize: (size: TContentFontSize) => void

  timestampFormat: TTimestampFormat
  updateTimestampFormat: (format: TTimestampFormat) => void
}

const UserPreferencesContext = createContext<TUserPreferencesContext | undefined>(undefined)

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { isSmallScreen } = useScreenSize()
  const [notificationListStyle, setNotificationListStyle] = useState(
    storage.getNotificationListStyle()
  )
  const [muteMedia, setMuteMedia] = useState(true)
  const [sidebarCollapse, setSidebarCollapse] = useState(storage.getSidebarCollapse())
  const [enableSingleColumnLayout, setEnableSingleColumnLayout] = useState(
    storage.getEnableSingleColumnLayout()
  )
  const [quickReaction, setQuickReaction] = useState(storage.getQuickReaction())
  const [quickReactionEmoji, setQuickReactionEmoji] = useState(storage.getQuickReactionEmoji())

  const [allowInsecureConnection, setAllowInsecureConnection] = useState(
    storage.getAllowInsecureConnection()
  )

  const [contentFontSize, setContentFontSize] = useState(storage.getContentFontSize())
  const [timestampFormat, setTimestampFormat] = useState(storage.getTimestampFormat())

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--content-font-size',
      CONTENT_FONT_SIZE_VALUES[contentFontSize] ?? '1rem'
    )
  }, [contentFontSize])

  useEffect(() => {
    if (!isSmallScreen && enableSingleColumnLayout) {
      document.documentElement.style.setProperty('overflow-y', 'scroll')
    } else {
      document.documentElement.style.removeProperty('overflow-y')
    }
  }, [enableSingleColumnLayout, isSmallScreen])

  const updateNotificationListStyle = (style: TNotificationStyle) => {
    setNotificationListStyle(style)
    storage.setNotificationListStyle(style)
  }

  const updateSidebarCollapse = (collapse: boolean) => {
    setSidebarCollapse(collapse)
    storage.setSidebarCollapse(collapse)
  }

  const updateEnableSingleColumnLayout = (enable: boolean) => {
    setEnableSingleColumnLayout(enable)
    storage.setEnableSingleColumnLayout(enable)
  }

  const updateQuickReaction = (enable: boolean) => {
    setQuickReaction(enable)
    storage.setQuickReaction(enable)
  }

  const updateQuickReactionEmoji = (emoji: string | TEmoji) => {
    setQuickReactionEmoji(emoji)
    storage.setQuickReactionEmoji(emoji)
  }

  const updateAllowInsecureConnection = (allow: boolean) => {
    setAllowInsecureConnection(allow)
    storage.setAllowInsecureConnection(allow)
  }

  const updateContentFontSize = (size: TContentFontSize) => {
    setContentFontSize(size)
    storage.setContentFontSize(size)
  }

  const updateTimestampFormat = (format: TTimestampFormat) => {
    setTimestampFormat(format)
    storage.setTimestampFormat(format)
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        notificationListStyle,
        updateNotificationListStyle,
        muteMedia,
        updateMuteMedia: setMuteMedia,
        sidebarCollapse,
        updateSidebarCollapse,
        enableSingleColumnLayout: isSmallScreen ? true : enableSingleColumnLayout,
        updateEnableSingleColumnLayout,
        quickReaction,
        updateQuickReaction,
        quickReactionEmoji,
        updateQuickReactionEmoji,
        allowInsecureConnection,
        updateAllowInsecureConnection,
        contentFontSize,
        updateContentFontSize,
        timestampFormat,
        updateTimestampFormat
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}
