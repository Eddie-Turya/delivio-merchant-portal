import { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { useEnv } from '../context/EnvContext'
import { Users, Search, Phone } from 'lucide-react'

function formatTZS(n: number) {
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `TZS ${(n / 1_000).toFixed(0)}K`
  return `TZS ${n.toLocaleString()}`
}

export function CustomersPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const { mode } = useEnv()

  const load = useCallback(() => {
    setLoading(true)
    api.customers({ search: search || undefined, envType: mode })
      .then((r: any) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, mode])

  useEffect(load, [load])

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users size={16} className="text-emerald-500" /> Customers
          </h1>
          <p className="text-xs text-gray-400">{data.length} customers · grouped by phone</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
            placeholder="Search by phone number…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-16" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-14 text-center">
            <Phone size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No customers yet</p>
            <p className="text-xs text-gray-400 mt-1">Customers appear here once payments include a phone number</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payments</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Spent</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((c: any) => (
                    <tr key={c.phone} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-sm text-gray-800 font-medium">{c.phone}</td>
                      <td className="px-5 py-3.5 text-right text-gray-600 tabular-nums">{c.paymentCount}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span className="text-emerald-600 font-semibold">{c.completedCount}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-gray-500">{c.paymentCount}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-900 tabular-nums">{formatTZS(c.totalVolume)}</td>
                      <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                        {new Date(c.lastPaymentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {data.map((c: any) => (
                <div key={c.phone} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-sm font-semibold text-gray-900">{c.phone}</p>
                    <p className="text-sm font-bold text-emerald-600">{formatTZS(c.totalVolume)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{c.completedCount}/{c.paymentCount} completed</span>
                    <span>·</span>
                    <span>Last {new Date(c.lastPaymentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
