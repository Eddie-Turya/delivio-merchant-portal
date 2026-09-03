import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type Mode = 'live' | 'sandbox'

interface EnvCtx {
  mode: Mode
  setMode: (m: Mode) => void
  isSandbox: boolean
  liveEnabled: boolean
}

const Ctx = createContext<EnvCtx>({ mode: 'sandbox', setMode: () => {}, isSandbox: true, liveEnabled: false })

export function EnvProvider({ children }: { children: ReactNode }) {
  // Live mode only available for merchants explicitly approved (status = 'live_enabled')
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')
  const liveEnabled = merchant.status === 'live_enabled'

  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('portalEnvMode') as Mode
    if (saved === 'live' && !liveEnabled) return 'sandbox'
    return saved || 'sandbox'
  })

  const setMode = (m: Mode) => {
    if (m === 'live' && !liveEnabled) return
    localStorage.setItem('portalEnvMode', m)
    setModeState(m)
  }

  return (
    <Ctx.Provider value={{ mode, setMode, isSandbox: mode === 'sandbox', liveEnabled }}>
      {children}
    </Ctx.Provider>
  )
}

export const useEnv = () => useContext(Ctx)
