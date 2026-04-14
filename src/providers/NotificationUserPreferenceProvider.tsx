import { createContext, useContext } from 'react'

type TNotificationUserPreferenceContext = {
  hideIndirect: boolean
  updateHideIndirect: (enable: boolean) => void
}

export const NotificationUserPreferenceContext =
  createContext<TNotificationUserPreferenceContext | null>(null)

export function useNotificationUserPreference() {
  const ctx = useContext(NotificationUserPreferenceContext)
  return ctx ?? { hideIndirect: false, updateHideIndirect: () => {} }
}
