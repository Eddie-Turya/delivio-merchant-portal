import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { TrendingUp, CreditCard, DollarSign, AlertTriangle, RotateCcw, Activity } from 'lucide-react'

function formatTZS(n: number) {
  if (n >= 1_000_000_000) return `TZS ${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `TZS ${(n / 1_000).toFixed(0)}K`
  return `TZS ${n.toLocaleString()}`
}

function Sk({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')

  useEffect(() => {
    api.stats().then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Volume', value: formatTZS(stats.totalVolume), icon: DollarSign, border: 'border-l-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', sub: 'Completed payments' },
    { label: 'Total Payments', value: stats.paymentCount.toLocaleString(), icon: CreditCard, border: 'border-l-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', sub: 'All time' },
    { label: 'Success Rate', value: `${stats.successRate.toFixed(1)}%`, icon: TrendingUp, border: stats.successRate >= 90 ? 'border-l-emerald-500' : 'border-l-amber-500', iconBg: stats.successRate >= 90 ? 'bg-emerald-50' : 'bg-amber-50', iconColor: stats.successRate >= 90 ? 'text-emerald-600' : 'text-amber-600', sub: 'Completion rate' },
    { label: 'Failed', value: stats.failedCount.toLocaleString(), icon: AlertTriangle, border: 'border-l-red-400', iconBg: 'bg-red-50', iconColor: 'text-red-500', sub: 'Failed transactions' },
    { label: 'Refunds', value: stats.refundCount.toLocaleString(), icon: RotateCcw, border: 'border-l-violet-400', iconBg: 'bg-violet-50', iconColor: 'text-violet-600', sub: 'Total refunds' },
  ] : []

  return (
    <Layout>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Overview</h1>
          <p className="text-xs text-gray-400">{merchant.name || 'Your merchant account'}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status banner */}
        {merchant.status === 'active' && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Your account is <strong>active</strong> and processing payments.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                  <Sk className="h-8 w-8 mb-4" />
                  <Sk className="h-3 w-20 mb-2" />
                  <Sk className="h-6 w-28 mb-1.5" />
                  <Sk className="h-3 w-16" />
                </div>
              ))
            : cards.map(({ label, value, icon: Icon, border, iconBg, iconColor, sub }) => (
                <div key={label} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${border} p-5 shadow-sm`}>
                  <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center mb-4`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'View Transactions', desc: 'Browse all your payment activity', href: '/payments', color: 'from-blue-500 to-blue-600' },
            { title: 'API Keys', desc: 'Manage your API credentials', href: '/api-keys', color: 'from-violet-500 to-violet-600' },
            { title: 'Webhooks', desc: 'Configure event notifications', href: '/webhooks', color: 'from-emerald-500 to-teal-600' },
          ].map(card => (
            <a
              key={card.title}
              href={card.href}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} mb-3 group-hover:scale-105 transition-transform`} />
              <p className="text-sm font-semibold text-gray-900">{card.title}</p>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
}
