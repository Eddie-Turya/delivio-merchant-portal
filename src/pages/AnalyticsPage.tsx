import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { useEnv } from '../context/EnvContext'
import { BarChart2, TrendingUp, Activity, Clock } from 'lucide-react'

function formatTZS(n: number) {
  if (n >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `TZS ${(n / 1_000).toFixed(0)}K`
  return `TZS ${n.toLocaleString()}`
}

function BarChart({ data, valueKey, color = '#10b981' }: {
  data: any[]; valueKey: string; labelKey?: string; color?: string
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className="flex items-end gap-0.5 h-28 w-full overflow-hidden">
      {data.map((d, i) => {
        const h = Math.max((d[valueKey] / max) * 100, 1)
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative">
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{ height: `${h}%`, background: color, opacity: 0.85 }}
            />
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
              <div className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap shadow-lg">
                {d[valueKey].toLocaleString()}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const colors: Record<string, string> = {
    COMPLETED: '#10b981', PENDING: '#f59e0b', FAILED: '#ef4444', REFUNDED: '#6366f1',
  }
  const total = data.reduce((s, d) => s + d.count, 0)
  if (!total) return <div className="h-28 flex items-center justify-center text-xs text-gray-300">No data</div>

  let cumulative = 0
  const cx = 50, cy = 50, r = 40, stroke = 14
  const segments = data.map(d => {
    const pct = d.count / total
    const start = cumulative * 360
    const end = (cumulative + pct) * 360
    cumulative += pct
    const large = end - start > 180 ? 1 : 0
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const x1 = cx + r * Math.sin(toRad(start))
    const y1 = cy - r * Math.cos(toRad(start))
    const x2 = cx + r * Math.sin(toRad(end))
    const y2 = cy - r * Math.cos(toRad(end))
    return { ...d, pct, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: colors[d.status] || '#9ca3af' }
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt" />
        ))}
        <text x="50" y="53" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#111827">{total.toLocaleString()}</text>
        <text x="50" y="62" textAnchor="middle" fontSize="7" fill="#9ca3af">total</text>
      </svg>
      <div className="space-y-1.5 text-xs">
        {segments.map(s => (
          <div key={s.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-gray-600">{s.status}</span>
            <span className="ml-auto font-semibold tabular-nums">{s.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeatRow({ hour, count, max }: { hour: number; count: number; max: number }) {
  const pct = max > 0 ? count / max : 0
  const label = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-7 text-gray-400 text-right">{label}</span>
      <div className="flex-1 h-3.5 rounded overflow-hidden bg-gray-100">
        <div className="h-full rounded bg-emerald-400 transition-all" style={{ width: `${pct * 100}%`, opacity: 0.7 + pct * 0.3 }} />
      </div>
      <span className="w-6 text-gray-500 tabular-nums">{count}</span>
    </div>
  )
}

export function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const { mode } = useEnv()

  const load = () => {
    setLoading(true)
    api.analytics({ days, envType: mode })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [days, mode])

  const daily = data?.daily || []
  const hourly = data?.hourly || []
  const hourlyMax = Math.max(...hourly.map((h: any) => h.count), 1)
  const totalVol = daily.reduce((s: number, d: any) => s + d.volume, 0)
  const totalTx = daily.reduce((s: number, d: any) => s + d.total, 0)
  const successRate = totalTx > 0 ? ((daily.reduce((s: number, d: any) => s + d.completed, 0) / totalTx) * 100).toFixed(1) : '0.0'

  const volData = daily.map((d: any) => ({ ...d, value: d.volume }))
  const txData = daily.map((d: any) => ({ ...d, value: d.total }))

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 size={16} className="text-emerald-500" /> Analytics
          </h1>
          <p className="text-xs text-gray-400">Transaction insights and trends</p>
        </div>
        <div className="flex gap-1">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${days === d ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Volume', value: loading ? '…' : formatTZS(totalVol), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Transactions', value: loading ? '…' : totalTx.toLocaleString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Success Rate', value: loading ? '…' : `${successRate}%`, icon: TrendingUp, color: Number(successRate) >= 90 ? 'text-emerald-600' : 'text-amber-600', bg: Number(successRate) >= 90 ? 'bg-emerald-50' : 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon size={13} className={color} />
              </div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-base font-bold text-gray-900 mt-0.5 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Volume chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Daily Volume</p>
              <p className="text-xs text-gray-400">Completed payment amounts</p>
            </div>
          </div>
          {loading ? <div className="h-28 animate-pulse bg-gray-50 rounded-lg" /> : (
            volData.length > 0
              ? <BarChart data={volData} valueKey="value" labelKey="day" color="#10b981" />
              : <div className="h-28 flex items-center justify-center text-xs text-gray-300">No data for this period</div>
          )}
        </div>

        {/* Transactions + Donut */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-1">Daily Transactions</p>
            <p className="text-xs text-gray-400 mb-4">All statuses</p>
            {loading ? <div className="h-28 animate-pulse bg-gray-50 rounded-lg" /> : (
              txData.length > 0
                ? <BarChart data={txData} valueKey="value" labelKey="day" color="#3b82f6" />
                : <div className="h-28 flex items-center justify-center text-xs text-gray-300">No data</div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-900 mb-1">Status Breakdown</p>
            <p className="text-xs text-gray-400 mb-4">All-time distribution</p>
            {loading ? <div className="h-28 animate-pulse bg-gray-50 rounded-lg" /> : <DonutChart data={data?.statusBreakdown || []} />}
          </div>
        </div>

        {/* Hourly heatmap */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-gray-400" />
            <div>
              <p className="text-sm font-bold text-gray-900">Peak Hours</p>
              <p className="text-xs text-gray-400">Transactions by hour of day (last 7 days)</p>
            </div>
          </div>
          {loading ? <div className="h-32 animate-pulse bg-gray-50 rounded-lg" /> : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {hourly.map((h: any) => (
                <HeatRow key={h.hour} hour={h.hour} count={h.count} max={hourlyMax} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
