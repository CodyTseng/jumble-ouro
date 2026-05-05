import { useCallback, useEffect, useRef, useState } from 'react'

function getScrollableAncestor(el: HTMLElement): HTMLElement | null {
  let current = el.parentElement
  while (current) {
    const { overflow, overflowY } = getComputedStyle(current)
    if (/(auto|scroll)/.test(overflow + overflowY)) {
      return current
    }
    current = current.parentElement
  }
  return null
}

export default function ReadingProgressBar({
  contentRef
}: {
  contentRef: React.RefObject<HTMLDivElement | null>
}) {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(0)

  const calculateProgress = useCallback(() => {
    const el = contentRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const totalScrollable = rect.height - viewportHeight

    if (totalScrollable <= 0) {
      setProgress(100)
      return
    }

    const scrolled = -rect.top
    const pct = Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100))
    setProgress(pct)
  }, [contentRef])

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(calculateProgress)
  }, [calculateProgress])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const scrollAncestor = getScrollableAncestor(el)
    const target = scrollAncestor || window

    target.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()

    return () => {
      cancelAnimationFrame(rafRef.current)
      target.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [contentRef, onScroll])

  return (
    <div className="sticky top-12 z-30 h-0.5 w-full bg-transparent">
      <div
        className="h-full bg-primary opacity-80 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
