import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Key, Webhook, LogOut, Zap, User, BookOpen, FlaskConical, Menu } from 'lucide-react'
import { api } from '../api'
import { useEnv } from '../context/EnvContext'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/payments', icon: CreditCard, label: 'Transactions' },
  { to: '/api-keys', icon: Key, label: 'API Keys' },
  { to: '/webhooks', icon: Webhook, label: 'Webhooks' },
  { to: '/playground', icon: FlaskConical, label: 'Playground' },
  { to: '/docs', icon: BookOpen, label: 'API Docs' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')
  const [open, setOpen] = useState(false)
  const { mode, setMode, isSandbox } = useEnv()

  const sidebar = (
    <aside className="w-60 bg-[#0d1117] flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Delivio Pay</p>
          <p className="text-[11px] text-slate-500 font-medium">Merchant Portal</p>
        </div>
      </div>

      {/* Environment toggle */}
      <div className="px-3 py-3 border-b border-white/[0.06]">
        <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMode('live')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'live'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${mode === 'live' ? 'bg-white' : 'bg-slate-500'}`} />
            Live
          </button>
          <button
            onClick={() => setMode('sandbox')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'sandbox'
                ? 'bg-violet-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical size={11} />
            Sandbox
          </button>
        </div>
        {isSandbox && (
          <p className="text-[10px] text-violet-400 text-center mt-1.5">Test mode — no real money</p>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3 space-y-1">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <User size={14} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{merchant.name || 'Merchant'}</p>
            <p className="text-[10px] text-slate-600 truncate">{merchant.slug}</p>
          </div>
        </div>
        <button
          onClick={() => { api.logout(); localStorage.removeItem('portalMerchant'); navigate('/login') }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0 w-60">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-60 h-full shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0d1117] border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Delivio Pay</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
