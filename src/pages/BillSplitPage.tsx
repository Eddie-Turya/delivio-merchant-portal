import { useState, useEffect } from 'react'
import { api } from '../api'
import { Layout } from '../components/Layout'
import { Users, Plus, X, ChevronDown, RefreshCw, CheckCircle, Clock, XCircle, Loader2, Trash2, Copy, QrCode, ExternalLink } from 'lucide-react'

function fmt(minor: number) {
  return `TZS ${(minor / 100).toLocaleString('en-TZ', { minimumFractionDigits: 2 })}`
}

function StatusPill({ status }: { status: string }) {
  if (status === 'completed' || status === 'paid') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle size={10} /> {status === 'completed' ? 'Completed' : 'Paid'}
    </span>
  )
  if (status === 'cancelled' || status === 'failed') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500 border border-red-200">
      <XCircle size={10} /> {status === 'cancelled' ? 'Cancelled' : 'Failed'}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
      <Clock size={10} /> Pending
    </span>
  )
}

// Minimal QR code using the Google Charts API replaced with a simple inline approach
// We use a public QR API endpoint for generation (just the img tag, not an external script)
function QRCodeImg({ url, size = 120 }: { url: string; size?: number }) {
  const encoded = encodeURIComponent(url)
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=4`}
      alt="QR code"
      width={size}
      height={size}
      className="rounded-lg border border-gray-200"
    />
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded-lg transition font-medium">
      {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

interface Participant {
  name: string
  phone: string
  amount_minor: number
}

type View = 'list' | 'create' | 'detail'

export default function BillSplitPage() {
  const [view, setView] = useState<View>('list')
  const [splits, setSplits] = useState<any[]>([])
  const [detail, setDetail] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [expandedSplit, setExpandedSplit] = useState<string | null>(null)
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null)

  // Create form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([
    { name: '', phone: '', amount_minor: 0 },
    { name: '', phone: '', amount_minor: 0 },
  ])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const loadList = () => {
    setLoading(true)
    api.listBillSplits()
      .then(d => setSplits(d.data || d || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadList() }, [])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const d = await api.getBillSplit(id)
      setDetail(d.data || d)
      setView('detail')
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  const cancel = async (id: string) => {
    if (!confirm('Cancel this bill split?')) return
    await api.cancelBillSplit(id)
    loadList()
    if (view === 'detail') setView('list')
  }

  const addParticipant = () => setParticipants(prev => [...prev, { name: '', phone: '', amount_minor: 0 }])
  const removeParticipant = (i: number) => setParticipants(prev => prev.filter((_, idx) => idx !== i))
  const updateParticipant = (i: number, field: keyof Participant, value: string | number) =>
    setParticipants(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))

  const totalMinor = participants.reduce((s, p) => s + (Number(p.amount_minor) || 0), 0)

  const handleCreate = async () => {
    setCreateError('')
    if (!title.trim()) { setCreateError('Title is required'); return }
    if (participants.length < 2) { setCreateError('At least 2 participants required'); return }
    for (const p of participants) {
      if (!p.name.trim() || !p.phone.trim()) { setCreateError('All participants need name and phone'); return }
      if (Number(p.amount_minor) < 200) { setCreateError('Minimum amount per participant is TZS 2.00'); return }
    }
    setCreating(true)
    try {
      const result = await api.createBillSplit({ title, description, participants })
      const created = result.data || result
      setTitle(''); setDescription('')
      setParticipants([{ name: '', phone: '', amount_minor: 0 }, { name: '', phone: '', amount_minor: 0 }])
      loadList()
      setDetail(created)
      setView('detail')
    } catch (e: any) {
      setCreateError(e?.response?.data?.error || e?.message || 'Failed to create bill split')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Layout>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bill Splits</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Generate a unique payment link + QR code per participant</p>
        </div>
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
              ← Back
            </button>
          )}
          {view === 'list' && (
            <>
              <button onClick={loadList} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <RefreshCw size={12} /> Refresh
              </button>
              <button onClick={() => setView('create')} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition">
                <Plus size={13} /> New Split
              </button>
            </>
          )}
        </div>
      </div>

      {/* CREATE FORM */}
      {view === 'create' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Users size={15} className="text-emerald-500" /> New Bill Split
          </h2>
          <p className="text-xs text-gray-400 -mt-3">Each participant gets their own payment link and QR code. They pay when ready — no USSD push until they scan.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="e.g. Team lunch" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="Optional note" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Participants *</label>
              <button onClick={addParticipant} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                <Plus size={11} /> Add person
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                  <input value={p.name} onChange={e => updateParticipant(i, 'name', e.target.value)}
                    placeholder="Full name" className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  <input value={p.phone} onChange={e => updateParticipant(i, 'phone', e.target.value)}
                    placeholder="0712345678" className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">TZS</span>
                    <input type="number" value={p.amount_minor ? p.amount_minor / 100 : ''} min={2}
                      onChange={e => updateParticipant(i, 'amount_minor', Math.round(Number(e.target.value) * 100))}
                      placeholder="0.00" className="w-24 text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 tabular-nums" />
                  </div>
                  {participants.length > 2 && (
                    <button onClick={() => removeParticipant(i)} className="text-gray-300 hover:text-red-400 transition flex-shrink-0">
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {totalMinor > 0 && (
              <p className="mt-2 text-xs text-gray-500 tabular-nums">
                Total: <span className="font-semibold text-gray-800">{fmt(totalMinor)}</span>
              </p>
            )}
          </div>

          {createError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>
          )}

          <div className="flex items-center gap-3">
            <button onClick={handleCreate} disabled={creating}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded-lg transition">
              {creating ? <><Loader2 size={13} className="animate-spin" /> Generating links…</> : <><QrCode size={14} /> Generate links &amp; QR codes</>}
            </button>
            <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && detail && (
        <div className="space-y-4">
          {/* Bill info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{detail.title}</h2>
                {detail.description && <p className="text-xs text-gray-400 mt-0.5">{detail.description}</p>}
              </div>
              <StatusPill status={detail.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Total: <span className="font-semibold text-gray-800 tabular-nums">{fmt(Number(detail.total_amount_minor))}</span></span>
              <span>{detail.participants?.length ?? 0} participants</span>
              <span>Created {new Date(detail.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button onClick={() => openDetail(detail.id)} disabled={detailLoading}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <RefreshCw size={12} className={detailLoading ? 'animate-spin' : ''} /> Refresh status
              </button>
              {detail.status === 'pending' && (
                <button onClick={() => cancel(detail.id)}
                  className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  <Trash2 size={12} /> Cancel split
                </button>
              )}
            </div>
          </div>

          {/* Per-participant links + QR codes */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
              Share with each participant — they pay via their link when ready
            </p>
            {(detail.participants || []).map((p: any) => {
              const isOpen = expandedParticipant === p.id
              const url = p.payment_url || `https://pay.deliviosend.com/pay/split/${p.id}`
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Participant header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedParticipant(isOpen ? null : p.id)}
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-gray-500">
                      {p.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.phone} · <span className="tabular-nums">{fmt(Number(p.amount_minor))}</span></p>
                    </div>
                    <StatusPill status={p.status} />
                    <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* QR + link */}
                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-start">
                      <QRCodeImg url={url} size={128} />
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Payment link</p>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <span className="text-xs text-gray-600 truncate flex-1 font-mono">{url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CopyButton text={url} />
                          <a href={url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg transition font-medium">
                            <ExternalLink size={11} /> Open
                          </a>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {p.status === 'paid'
                            ? '✓ Payment received'
                            : p.status === 'failed'
                            ? 'Payment failed — participant can retry via the link'
                            : 'Waiting for participant to pay'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Bill Splits</span>
            {!loading && <span className="ml-auto text-xs text-gray-400">{splits.length} total</span>}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[0, 1, 2].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : splits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-5">
              <div className="p-4 rounded-2xl bg-gray-100 mb-4"><QrCode size={28} className="text-gray-400" /></div>
              <p className="text-gray-600 font-semibold text-sm mb-1">No bill splits yet</p>
              <p className="text-gray-400 text-xs mb-4">Create one to generate unique payment links for each participant.</p>
              <button onClick={() => setView('create')}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition">
                <Plus size={13} /> Create bill split
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {splits.map((s: any) => {
                const isOpen = expandedSplit === s.id
                return (
                  <div key={s.id}>
                    <div
                      className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedSplit(isOpen ? null : s.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {fmt(Number(s.total_amount_minor))} · {s.participant_count} participants
                          {s.paid_count > 0 && <span className="ml-1.5 text-emerald-600 font-medium">· {s.paid_count}/{s.participant_count} paid</span>}
                        </p>
                      </div>
                      <StatusPill status={s.status} />
                      <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 bg-gray-50/40 border-t border-gray-100 flex gap-2">
                        <button onClick={() => openDetail(s.id)} disabled={detailLoading}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 bg-white px-3 py-1.5 rounded-lg transition">
                          {detailLoading ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />} View links & QR codes
                        </button>
                        {s.status === 'pending' && (
                          <button onClick={() => cancel(s.id)}
                            className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 bg-white px-3 py-1.5 rounded-lg transition">
                            <Trash2 size={12} /> Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
    </Layout>
  )
}
