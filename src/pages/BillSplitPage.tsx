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

function QRImg({ url, size = 128 }: { url: string; size?: number }) {
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=4`}
      alt="QR code" width={size} height={size}
      className="rounded-xl border border-gray-200 shadow-sm"
    />
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition font-semibold">
      {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

interface Participant { name: string; phone: string; amount_minor: number }
type View = 'list' | 'create' | 'detail'

export default function BillSplitPage() {
  const [view, setView] = useState<View>('list')
  const [splits, setSplits] = useState<any[]>([])
  const [detail, setDetail] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [expandedSplit, setExpandedSplit] = useState<string | null>(null)

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
    api.listBillSplits().then(d => setSplits(d.data || d || [])).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { loadList() }, [])

  const openDetail = async (id: string) => {
    setDetailLoading(true)
    try { const d = await api.getBillSplit(id); setDetail(d.data || d); setView('detail') }
    catch (e) { console.error(e) }
    finally { setDetailLoading(false) }
  }

  const cancelSplit = async (id: string) => {
    if (!confirm('Cancel this bill split?')) return
    await api.cancelBillSplit(id); loadList()
    if (view === 'detail') setView('list')
  }

  const addParticipant = () => setParticipants(p => [...p, { name: '', phone: '', amount_minor: 0 }])
  const removeParticipant = (i: number) => setParticipants(p => p.filter((_, idx) => idx !== i))
  const update = (i: number, f: keyof Participant, v: string | number) =>
    setParticipants(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x))

  const totalMinor = participants.reduce((s, p) => s + (Number(p.amount_minor) || 0), 0)

  const handleCreate = async () => {
    setCreateError('')
    if (!title.trim()) { setCreateError('Title is required'); return }
    if (participants.length < 2) { setCreateError('At least 2 participants required'); return }
    for (const p of participants) {
      if (!p.name.trim() || !p.phone.trim()) { setCreateError('All participants need name and phone'); return }
      if (Number(p.amount_minor) < 200) { setCreateError('Minimum TZS 2.00 per participant'); return }
    }
    setCreating(true)
    try {
      const result = await api.createBillSplit({ title, description, participants })
      const created = result.data || result
      setTitle(''); setDescription('')
      setParticipants([{ name: '', phone: '', amount_minor: 0 }, { name: '', phone: '', amount_minor: 0 }])
      loadList(); setDetail(created); setView('detail')
    } catch (e: any) {
      setCreateError(e?.response?.data?.error || e?.message || 'Failed')
    } finally { setCreating(false) }
  }

  const paymentUrl = detail?.payment_url || (detail?.id ? `https://pay.deliviosend.com/pay/split/${detail.id}` : '')

  return (
    <Layout>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bill Splits</h1>
          <p className="text-gray-400 mt-0.5 text-sm">One shared link — each person enters their phone to see their amount</p>
        </div>
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">← Back</button>
          )}
          {view === 'list' && <>
            <button onClick={loadList} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={() => setView('create')} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition">
              <Plus size={13} /> New Split
            </button>
          </>}
        </div>
      </div>

      {/* CREATE */}
      {view === 'create' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Users size={15} className="text-emerald-500" /> New Bill Split</h2>
          <p className="text-xs text-gray-400 -mt-3">Share one link with all participants. Each person enters their phone number to see their share and pay.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Team lunch"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Participants *</label>
              <button onClick={addParticipant} className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><Plus size={11} /> Add</button>
            </div>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                  <input value={p.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Full name"
                    className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  <input value={p.phone} onChange={e => update(i, 'phone', e.target.value)} placeholder="0712345678"
                    className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">TZS</span>
                    <input type="number" min={2} placeholder="0.00"
                      value={p.amount_minor ? p.amount_minor / 100 : ''}
                      onChange={e => update(i, 'amount_minor', Math.round(Number(e.target.value) * 100))}
                      className="w-24 text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 tabular-nums" />
                  </div>
                  {participants.length > 2 && (
                    <button onClick={() => removeParticipant(i)} className="text-gray-300 hover:text-red-400 transition"><X size={13} /></button>
                  )}
                </div>
              ))}
            </div>
            {totalMinor > 0 && (
              <p className="mt-2 text-xs text-gray-500 tabular-nums">Total: <span className="font-semibold text-gray-800">{fmt(totalMinor)}</span></p>
            )}
          </div>

          {createError && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{createError}</p>}

          <div className="flex items-center gap-3">
            <button onClick={handleCreate} disabled={creating}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded-lg transition">
              {creating ? <><Loader2 size={13} className="animate-spin" /> Creating…</> : <><QrCode size={14} /> Generate shared link</>}
            </button>
            <button onClick={() => setView('list')} className="text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {/* DETAIL */}
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
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
              <span>Total: <span className="font-semibold text-gray-800 tabular-nums">{fmt(Number(detail.total_amount_minor))}</span></span>
              <span>{detail.participants?.length ?? 0} participants</span>
              <span>Created {new Date(detail.created_at).toLocaleDateString()}</span>
            </div>

            {/* One shared QR + link */}
            {paymentUrl && (
              <div className="flex flex-col sm:flex-row gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                <QRImg url={paymentUrl} size={140} />
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Shared payment link</p>
                  <p className="text-[11px] text-gray-400">Share this link or QR with everyone. Each person enters their phone number to see and pay their share.</p>
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <span className="text-xs text-gray-600 truncate flex-1 font-mono">{paymentUrl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyBtn text={paymentUrl} />
                    <a href={paymentUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-white transition font-medium">
                      <ExternalLink size={11} /> Preview
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => openDetail(detail.id)} disabled={detailLoading}
                className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <RefreshCw size={12} className={detailLoading ? 'animate-spin' : ''} /> Refresh status
              </button>
              {detail.status === 'pending' && (
                <button onClick={() => cancelSplit(detail.id)}
                  className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  <Trash2 size={12} /> Cancel split
                </button>
              )}
            </div>
          </div>

          {/* Participant statuses */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-700">Participants</p>
            </div>
            <div className="divide-y divide-gray-50">
              {(detail.participants || []).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-gray-500">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.phone}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-700 tabular-nums">{fmt(Number(p.amount_minor))}</span>
                  <StatusPill status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Bill Splits</span>
            {!loading && <span className="ml-auto text-xs text-gray-400">{splits.length} total</span>}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">{[0,1,2].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
          ) : splits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-5">
              <div className="p-4 rounded-2xl bg-gray-100 mb-4"><QrCode size={28} className="text-gray-400" /></div>
              <p className="text-gray-600 font-semibold text-sm mb-1">No bill splits yet</p>
              <p className="text-gray-400 text-xs mb-4">Create one to generate a shared payment link.</p>
              <button onClick={() => setView('create')} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition">
                <Plus size={13} /> Create bill split
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {splits.map((s: any) => {
                const isOpen = expandedSplit === s.id
                return (
                  <div key={s.id}>
                    <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedSplit(isOpen ? null : s.id)}>
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
                          {detailLoading ? <Loader2 size={12} className="animate-spin" /> : <QrCode size={12} />} View link
                        </button>
                        {s.status === 'pending' && (
                          <button onClick={() => cancelSplit(s.id)}
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
