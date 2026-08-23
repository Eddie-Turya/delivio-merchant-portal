import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { ArrowLeft, RefreshCw, RotateCcw, CheckCircle2, XCircle, Clock, AlertCircle, Check, Copy } from 'lucide-react'

function statusBadge(s: string) {
  const map: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    FAILED: 'bg-red-50 text-red-600 border-red-200',
    REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return map[s] || 'bg-gray-100 text-gray-600 border-gray-200'
}

function StatusIcon({ s }: { s: string }) {
  if (s === 'COMPLETED') return <CheckCircle2 size={14} className="text-emerald-500" />
  if (s === 'FAILED') return <XCircle size={14} className="text-red-400" />
  return <Clock size={14} className="text-amber-400" />
}

function fmt(n: number) { return `TZS ${Number(n).toLocaleString()}` }

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refunding, setRefunding] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundMsg, setRefundMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const load = () => {
    setLoading(true)
    api.paymentDetail(id!).then(setData).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const copyId = () => {
    navigator.clipboard.writeText(id!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const doRefund = async () => {
    setRefunding(true); setRefundMsg(null)
    try {
      await api.refundPayment(id!, refundReason || undefined)
      setRefundMsg({ ok: true, text: 'Refund issued — payment marked as REFUNDED' })
      setShowRefund(false)
      load()
    } catch (err: any) {
      setRefundMsg({ ok: false, text: err.message })
    } finally { setRefunding(false) }
  }

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/payments')} className="text-gray-400 hover:text-gray-700 transition p-1 -ml-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900">Payment Detail</h1>
          <p className="text-xs text-gray-400 font-mono truncate">{id}</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition min-h-[38px]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline text-xs">Refresh</span>
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse h-28" />)}
          </div>
        ) : !data ? (
          <div className="text-center py-16 text-sm text-gray-400">Payment not found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* LEFT */}
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{fmt(data.amount)}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{data.currency}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge(data.status)}`}>
                    <StatusIcon s={data.status} />
                    {data.status}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    ['Payment ID', <span className="flex items-center gap-1.5 font-mono text-xs text-gray-600">
                      {data.id}
                      <button onClick={copyId} className="text-gray-300 hover:text-gray-600">
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    </span>],
                    ['Reference', <span className="text-sm text-gray-700">{data.reference || '—'}</span>],
                    ['Environment', <span className={`text-xs font-semibold px-2 py-0.5 rounded ${data.environment?.name?.includes('sandbox') || data.environment?.prefix?.includes('test') ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>{data.environment?.name || '—'}</span>],
                    ['Created', <span className="text-sm text-gray-600">{new Date(data.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>],
                    ['Updated', <span className="text-sm text-gray-600">{new Date(data.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>],
                  ].map(([label, val]: any) => (
                    <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-shrink-0">{label}</p>
                      <div className="text-right">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund */}
              {data.status === 'COMPLETED' && data.refunds?.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <RotateCcw size={15} className="text-gray-400" />
                    <h2 className="text-sm font-bold text-gray-900">Issue Refund</h2>
                  </div>
                  {refundMsg && (
                    <div className={`flex items-center gap-2 text-xs font-medium mb-3 ${refundMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                      {refundMsg.ok ? <Check size={13} /> : <AlertCircle size={13} />} {refundMsg.text}
                    </div>
                  )}
                  {!showRefund ? (
                    <button onClick={() => setShowRefund(true)} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition border border-red-200">
                      <RotateCcw size={14} /> Refund {fmt(data.amount)}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                        This will refund <strong>{fmt(data.amount)}</strong> and mark the payment as REFUNDED. This cannot be undone.
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reason (optional)</label>
                        <input type="text" value={refundReason} onChange={e => setRefundReason(e.target.value)}
                          placeholder="Customer request, duplicate charge…"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={doRefund} disabled={refunding}
                          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                          {refunding ? 'Processing…' : 'Confirm Refund'}
                        </button>
                        <button onClick={() => setShowRefund(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Existing refunds */}
              {data.refunds?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <RotateCcw size={15} className="text-gray-400" />
                    <h2 className="text-sm font-bold text-gray-900">Refund</h2>
                  </div>
                  {data.refunds.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-purple-700">{fmt(r.amount_minor)}</p>
                        {r.reason && <p className="text-xs text-gray-400 mt-0.5">{r.reason}</p>}
                        <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* Provider attempts */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Provider Attempts</h2>
                {data.attempts?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No provider attempts recorded</p>
                ) : (
                  <div className="space-y-3">
                    {data.attempts?.map((a: any, i: number) => (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/60">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700">{a.provider_code || 'SELCOM'}</p>
                          {a.provider_reference && (
                            <p className="text-[11px] font-mono text-gray-500 break-all mt-0.5">{a.provider_reference}</p>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Timeline</h2>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
                  <div className="space-y-4">
                    {[
                      { label: 'Payment created', time: data.createdAt, done: true },
                      { label: 'USSD push sent', time: data.attempts?.[0]?.created_at, done: !!data.attempts?.length },
                      { label: data.status === 'FAILED' ? 'Payment failed' : data.status === 'REFUNDED' ? 'Payment refunded' : data.status === 'COMPLETED' ? 'Payment completed' : 'Awaiting confirmation', time: data.status !== 'PENDING' && data.status !== 'PROCESSING' ? data.updatedAt : null, done: ['COMPLETED','FAILED','REFUNDED'].includes(data.status) },
                    ].map(({ label, time, done }, i) => (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${done ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                          {done ? <Check size={11} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                        </div>
                        <div className="pt-0.5">
                          <p className={`text-xs font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                          {time && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(time).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
