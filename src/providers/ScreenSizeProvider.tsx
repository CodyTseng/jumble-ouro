import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type TScreenSizeContext = {
  isSmallScreen: boolean
  isLargeScreen: boolean
}

const ScreenSizeContext = createContext<TScreenSizeContext | undefined>(undefined)

export const useScreenSize = () => {
  const context = useContext(ScreenSizeContext)
  if (!context) {
    throw new Error('useScreenSize must be used within a ScreenSizeProvider')
  }
  return context
}

export function ScreenSizeProvider({ children }: { children: React.ReactNode }) {
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth <= 768)
  const [isLargeScreen, setIsLargeScreen] = useState(() => window.innerWidth >= 1280)

  useEffect(() => {
    const smallQuery = window.matchMedia('(max-width: 768px)')
    const largeQuery = window.matchMedia('(min-width: 1280px)')

    const handleSmallChange = (e: MediaQueryListEvent) => setIsSmallScreen(e.matches)
    const handleLargeChange = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches)

    smallQuery.addEventListener('change', handleSmallChange)
    largeQuery.addEventListener('change', handleLargeChange)

    return () => {
      smallQuery.removeEventListener('change', handleSmallChange)
      largeQuery.removeEventListener('change', handleLargeChange)
    }
  }, [])

  const value = useMemo(() => ({ isSmallScreen, isLargeScreen }), [isSmallScreen, isLargeScreen])

  return <ScreenSizeContext.Provider value={value}>{children}</ScreenSizeContext.Provider>
}
