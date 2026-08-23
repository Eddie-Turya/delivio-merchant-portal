import { useEffect, useRef, useCallback } from 'react'

const IDLE_MS = 5 * 60 * 1000 // 5 minutes
const WARN_MS = 4 * 60 * 1000 // warn at 4 minutes (1 min before)

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const

export function useIdleTimeout(onTimeout: () => void, onWarn?: (secondsLeft: number) => void) {
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (warnTimer.current) clearTimeout(warnTimer.current)

    if (onWarn) {
      warnTimer.current = setTimeout(() => onWarn(60), WARN_MS)
    }
    logoutTimer.current = setTimeout(onTimeout, IDLE_MS)
  }, [onTimeout, onWarn])

  useEffect(() => {
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
      if (warnTimer.current) clearTimeout(warnTimer.current)
      EVENTS.forEach(e => window.removeEventListener(e, reset))
    }
  }, [reset])
}
