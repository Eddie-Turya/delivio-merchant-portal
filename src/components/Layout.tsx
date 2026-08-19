import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Key, Webhook, LogOut, Zap, User, BookOpen } from 'lucide-react'
import { api } from '../api'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/payments', icon: CreditCard, label: 'Transactions' },
  { to: '/api-keys', icon: Key, label: 'API Keys' },
  { to: '/webhooks', icon: Webhook, label: 'Webhooks' },
  { to: '/docs', icon: BookOpen, label: 'API Docs' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d1117] flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Delivio Pay</p>
            <p className="text-[11px] text-slate-500 font-medium">Merchant Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
