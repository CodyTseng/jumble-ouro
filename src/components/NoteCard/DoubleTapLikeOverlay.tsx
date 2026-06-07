import Emoji from '@/components/Emoji'
import { TEmoji } from '@/types'
import { useEffect, useState } from 'react'

export default function DoubleTapLikeOverlay({ emoji }: { emoji: string | TEmoji }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <span className="animate-double-tap-like text-5xl">
        <Emoji emoji={emoji} classNames={{ img: 'size-12' }} />
      </span>
    </div>
  )
}
