import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type Mode = 'live' | 'sandbox'

interface EnvCtx {
  mode: Mode
  setMode: (m: Mode) => void
  isSandbox: boolean
}

const Ctx = createContext<EnvCtx>({ mode: 'live', setMode: () => {}, isSandbox: false })

export function EnvProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    return (localStorage.getItem('portalEnvMode') as Mode) || 'live'
  })

  const setMode = (m: Mode) => {
    localStorage.setItem('portalEnvMode', m)
    setModeState(m)
  }

  return (
    <Ctx.Provider value={{ mode, setMode, isSandbox: mode === 'sandbox' }}>
      {children}
    </Ctx.Provider>
  )
}

export const useEnv = () => useContext(Ctx)
