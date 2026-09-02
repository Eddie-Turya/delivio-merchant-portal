import { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { useEnv } from '../context/EnvContext'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, FlaskConical, Download, Calendar } from 'lucide-react'

const STATUSES = ['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED']

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

function statusBadge(s: string) {
  const map: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    FAILED: 'bg-red-50 text-red-600',
    REFUNDED: 'bg-blue-50 text-blue-700',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

function formatTZS(n: number) {
  return `TZS ${Number(n).toLocaleString()}`
}

export function PaymentsPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const { mode, isSandbox } = useEnv()
  const navigate = useNavigate()
  const PAGE = 20
  const [exporting, setExporting] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const doExport = async () => {
    setExporting(true)
    try {
      const blob = await api.exportPayments({ status, search, envType: mode, from: dateFrom || undefined, to: dateTo || undefined })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err) }
    finally { setExporting(false) }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.payments({ limit: PAGE, offset: page * PAGE, status, search, envType: mode, from: dateFrom || undefined, to: dateTo || undefined })
      setData(res.data)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, status, search, mode, dateFrom, dateTo])

  useEffect(() => {
    setPage(0)
    setData([])
  }, [mode])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / PAGE)

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900">Transactions</h1>
            {isSandbox && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                <FlaskConical size={9} /> SANDBOX
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{total.toLocaleString()} payment{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={doExport} disabled={exporting} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition min-h-[38px] disabled:opacity-50">
            <Download size={14} />
            <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export'}</span>
          </button>
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition min-h-[38px]">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(0) } }}
              placeholder="Search ID or reference…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  status === s
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Date range */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar size={13} className="text-gray-400" />
            <input type="date" value={dateFrom} max={dateTo || today()}
              onChange={e => { setDateFrom(e.target.value); setPage(0) }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white text-gray-700" />
            <span className="text-xs text-gray-400">to</span>
            <input type="date" value={dateTo} min={dateFrom} max={today()}
              onChange={e => { setDateTo(e.target.value); setPage(0) }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white text-gray-700" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); setPage(0) }}
                className="text-xs text-gray-400 hover:text-gray-700 underline">Clear</button>
            )}
            <div className="flex gap-1">
              {[{l:'Today', f:today(), t:today()},{l:'7d', f:daysAgo(7), t:today()},{l:'30d', f:daysAgo(30), t:today()}].map(({l,f,t}) => (
                <button key={l} onClick={() => { setDateFrom(f); setDateTo(t); setPage(0) }}
                  className="px-2 py-1 text-[10px] font-semibold border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 transition">{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">No payments found</div>
          ) : (
            data.map(p => (
              <div key={p.id} onClick={() => navigate(`/payments/${p.id}`)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.reference || '—'}</p>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{p.id.slice(0, 12)}…</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${statusBadge(p.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">{formatTZS(p.amount)}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                {p.fee_minor > 0 && (
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
                    <span className="text-[11px] text-gray-400">Fee ({p.fee_bearer === 'customer' ? 'customer pays' : 'merchant pays'})</span>
                    <span className="text-[11px] text-red-500 font-medium">−{formatTZS(p.fee_minor)}</span>
                  </div>
                )}
                {p.fee_minor > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Received</span>
                    <span className="text-[11px] font-semibold text-emerald-600">{formatTZS(p.net_amount_minor ?? p.amount)}</span>
                  </div>
                )}
                {p.payer_phone && <p className="text-[11px] text-gray-400 mt-1">{p.payer_phone}</p>}
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fee</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-gray-400">No payments found</td></tr>
                ) : (
                  data.map(p => (
                    <tr key={p.id} onClick={() => navigate(`/payments/${p.id}`)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}…</td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{p.reference || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{p.payer_phone || '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{formatTZS(p.amount)}</td>
                      <td className="px-5 py-3.5 text-xs">
                        {p.fee_minor > 0 ? (
                          <span className="flex flex-col gap-0.5">
                            <span className="text-red-500 font-medium">−{formatTZS(p.fee_minor)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit ${p.fee_bearer === 'customer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                              {p.fee_bearer === 'customer' ? 'Customer' : 'Merchant'}
                            </span>
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-600">{formatTZS(p.net_amount_minor ?? p.amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {page + 1} of {totalPages} · {total.toLocaleString()} results</p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="sm:hidden flex items-center justify-between py-1">
            <p className="text-xs text-gray-400">{page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 min-h-[38px]">← Prev</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 min-h-[38px]">Next →</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
