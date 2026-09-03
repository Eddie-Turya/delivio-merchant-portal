import { useState, useCallback, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Key, Webhook, LogOut, User, BookOpen, FlaskConical, Menu, Link2, Clock, ArrowUpRight, Rows3, Users, BarChart2, UserCheck, Shield, HelpCircle, FileText, Lock, RefreshCw } from 'lucide-react'
import { api } from '../api'
import { useEnv } from '../context/EnvContext'
import { useIdleTimeout } from '../hooks/useIdleTimeout'
import { LiveApprovedModal } from './LiveApprovedModal'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/bill-splits', icon: Users, label: 'Bill Splits' },
  { to: '/collect', icon: Link2, label: 'Collect' },
  { to: '/payment-links', icon: Link2, label: 'Payment Links' },
  { to: '/bulk', icon: Rows3, label: 'Bulk', soon: true },
  { to: '/payments', icon: CreditCard, label: 'Transactions' },
  { to: '/customers', icon: UserCheck, label: 'Customers' },
  { to: '/disbursement', icon: ArrowUpRight, label: 'Disbursement', soon: true },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/api-keys', icon: Key, label: 'API Keys' },
  { to: '/webhooks', icon: Webhook, label: 'Webhooks' },
  { to: '/audit', icon: Shield, label: 'Audit Log' },
  { to: '/playground', icon: FlaskConical, label: 'Playground' },
  { to: '/docs', icon: BookOpen, label: 'API Docs' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')
  const [open, setOpen] = useState(false)
  const [idleWarning, setIdleWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const { mode, setMode, isSandbox, liveEnabled, refreshStatus, statusChecking } = useEnv()

  const doLogout = useCallback(() => {
    api.logout()
    localStorage.removeItem('portalMerchant')
    localStorage.removeItem('portalUser')
    navigate('/login')
  }, [navigate])

  const onWarn = useCallback(() => { setIdleWarning(true); setCountdown(60) }, [])

  useIdleTimeout(doLogout, onWarn)

  useEffect(() => {
    if (!idleWarning) return
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [idleWarning, countdown])

  const sidebar = (
    <aside className="w-60 bg-[#0d1117] flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/[0.06] flex items-center gap-3">
        <img src="/logo.png" alt="Wisopay" className="w-8 h-8 rounded-lg shadow-lg" />
        <div>
          <p className="text-sm font-bold text-white leading-tight">Wisopay</p>
          <p className="text-[11px] text-slate-500 font-medium">Merchant Portal</p>
        </div>
      </div>

      {/* Environment toggle */}
      <div className="px-3 py-3 border-b border-white/[0.06]">
        <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => liveEnabled && setMode('live')}
            disabled={!liveEnabled || statusChecking}
            title={liveEnabled ? 'Switch to live mode' : 'Live mode locked — pending admin approval'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'live'
                ? 'bg-emerald-500 text-white shadow-sm'
                : liveEnabled
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            {statusChecking
              ? <RefreshCw size={10} className="animate-spin" />
              : liveEnabled
                ? <span className={`w-1.5 h-1.5 rounded-full ${mode === 'live' ? 'bg-white' : 'bg-slate-500'}`} />
                : <Lock size={10} />}
            Live
          </button>
          <button
            onClick={() => setMode('sandbox')}
            disabled={statusChecking}
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
        {isSandbox && liveEnabled && (
          <p className="text-[10px] text-emerald-400 text-center mt-1.5">Live mode available — click to switch</p>
        )}
        {isSandbox && !liveEnabled && (
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <p className="text-[10px] text-slate-500">Pending KYC approval</p>
            <button
              onClick={() => refreshStatus()}
              disabled={statusChecking}
              title="Check if your account has been approved"
              className="text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={9} className={statusChecking ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, soon }: any) => (
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
            <span className="flex-1">{label}</span>
            {soon && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">SOON</span>}
          </NavLink>
        ))}
      </nav>

      <div className="md:hidden border-t border-white/[0.06] p-3 space-y-1">
        <NavLink
          to="/account"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`
          }
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{merchant.name || 'Merchant'}</p>
            <p className="text-[10px] text-slate-500 truncate">{merchant.slug}</p>
          </div>
        </NavLink>
        <button
          onClick={doLogout}
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
      <LiveApprovedModal />
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
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-end gap-2 px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'text-slate-500 hover:bg-gray-100 hover:text-slate-700'
              }`
            }
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <User size={13} className="text-emerald-500" />
            </div>
            <span>{merchant.name || 'Account'}</span>
          </NavLink>
          <button
            onClick={doLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0d1117] border-b border-white/[0.06] flex-shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Wisopay" className="w-6 h-6 rounded-md" />
            <span className="text-sm font-bold text-white">Wisopay</span>
          </div>
        </div>

        {/* Idle warning modal */}
        {idleWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
              {/* Amber header */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Clock size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Still there?</h3>
                <p className="text-amber-100 text-sm mt-1">You've been inactive for a while</p>
              </div>
              {/* Body */}
              <div className="px-6 py-5 text-center">
                <p className="text-gray-600 text-sm mb-1">You'll be logged out automatically in</p>
                <p className="text-4xl font-extrabold text-gray-900 tabular-nums my-3">{countdown}s</p>
                <p className="text-xs text-gray-400 mb-6">Any activity resets the timer</p>
                <button
                  onClick={() => setIdleWarning(false)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  Yes, keep me logged in
                </button>
                <button
                  onClick={doLogout}
                  className="w-full mt-2 py-2.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  Log out now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
