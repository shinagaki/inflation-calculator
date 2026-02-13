import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

export const useCountUp = (target: number, duration = 600): number => {
  const [current, setCurrent] = useState(target)
  const prevTarget = useRef(target)
  const rafId = useRef<number>()

  useEffect(() => {
    if (prevTarget.current === target) return

    if (prefersReducedMotion?.matches) {
      prevTarget.current = target
      setCurrent(target)
      return
    }

    const start = prevTarget.current
    const diff = target - start
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - (1 - progress) ** 3
      setCurrent(Math.round(start + diff * eased))

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        prevTarget.current = target
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [target, duration])

  // 初回レンダリング時に値を同期
  useEffect(() => {
    prevTarget.current = target
    setCurrent(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return current
}
