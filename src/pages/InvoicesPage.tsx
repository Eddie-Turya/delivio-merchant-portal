import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Plus, Search, FileText, Copy, ExternalLink, Trash2, Send, CheckCircle2, AlertCircle, XCircle, RefreshCw } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT:    { label: 'Draft',    color: 'bg-gray-100 text-gray-600',    icon: FileText },
  SENT:     { label: 'Sent',     color: 'bg-blue-100 text-blue-700',    icon: Send },
  PAID:     { label: 'Paid',     color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  OVERDUE:  { label: 'Overdue',  color: 'bg-red-100 text-red-600',      icon: AlertCircle },
  CANCELLED:{ label: 'Cancelled',color: 'bg-gray-100 text-gray-400',    icon: XCircle },
}

function fmt(amount: number, currency = 'TZS') {
  return `${currency} ${Number(amount / 1).toLocaleString()}`
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  return `Due in ${diff}d`
}

export function InvoicesPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api.invoices({ status: filter === 'ALL' ? undefined : filter, search: search || undefined })
      .then((d: any) => setInvoices(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filter, search])

  useEffect(() => { load() }, [load])

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const sendInvoice = async (id: string) => {
    setActing(id)
    try {
      const updated = await api.sendInvoice(id)
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv))
    } catch (e: any) { alert(e.message) }
    finally { setActing(null) }
  }

  const markPaid = async (id: string) => {
    setActing(id)
    try {
      const updated = await api.markInvoicePaid(id)
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv))
    } catch (e: any) { alert(e.message) }
    finally { setActing(null) }
  }

  const deleteInvoice = async (id: string, num: string) => {
    if (!confirm(`Delete invoice ${num}?`)) return
    setActing(id)
    try {
      await api.deleteInvoice(id)
      setInvoices(prev => prev.filter(inv => inv.id !== id))
    } catch (e: any) { alert(e.message) }
    finally { setActing(null) }
  }

  const totals = {
    outstanding: invoices.filter(i => ['SENT','OVERDUE'].includes(i.status)).reduce((s, i) => s + Number(i.total_amount), 0),
    paid: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.total_amount), 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
  }

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">Invoices</h1>
          <p className="text-xs text-gray-400 hidden sm:block">Create, send, and track customer invoices</p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
        >
          <Plus size={15} /> New Invoice
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Outstanding', value: fmt(totals.outstanding), color: 'text-blue-600' },
            { label: 'Collected',   value: fmt(totals.paid),        color: 'text-emerald-600' },
            { label: 'Overdue',     value: `${totals.overdue} invoice${totals.overdue !== 1 ? 's' : ''}`, color: totals.overdue ? 'text-red-500' : 'text-gray-400' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{card.label}</p>
              <p className={`text-sm font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer or invoice number…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['ALL','DRAFT','SENT','PAID','OVERDUE'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
            <button onClick={load} className="px-2 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}</div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4"><FileText size={28} className="text-gray-400" /></div>
              <p className="text-sm font-semibold text-gray-700">No invoices yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first invoice to get paid faster</p>
              <button onClick={() => navigate('/invoices/new')}
                className="mt-4 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                <Plus size={14} /> Create Invoice
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {invoices.map(inv => {
                const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.DRAFT
                const StatusIcon = cfg.icon
                const due = inv.due_date ? daysUntil(inv.due_date.split('T')[0]) : null
                const isActing = acting === inv.id
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/60 transition group">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <StatusIcon size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{inv.invoice_number}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        {due && inv.status === 'SENT' && (
                          <span className="text-[10px] text-amber-600 font-medium">{due}</span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <span className="text-[10px] text-red-500 font-medium">{due}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{inv.customer_name}{inv.customer_email ? ` · ${inv.customer_email}` : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{fmt(inv.total_amount, inv.currency)}</p>
                      <p className="text-[10px] text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {inv.status === 'DRAFT' && (
                        <button title="Send invoice" disabled={isActing}
                          onClick={() => sendInvoice(inv.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition disabled:opacity-40">
                          <Send size={14} />
                        </button>
                      )}
                      {['SENT','OVERDUE'].includes(inv.status) && inv.payment_link_url && (
                        <>
                          <button title={copied === inv.id ? 'Copied!' : 'Copy payment link'} onClick={() => copyLink(inv.payment_link_url, inv.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                            {copied === inv.id ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                          <a href={inv.payment_link_url} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                            <ExternalLink size={14} />
                          </a>
                          <button title="Mark as paid" disabled={isActing}
                            onClick={() => markPaid(inv.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition disabled:opacity-40">
                            <CheckCircle2 size={14} />
                          </button>
                        </>
                      )}
                      {inv.status === 'DRAFT' && (
                        <button title="Delete" disabled={isActing}
                          onClick={() => deleteInvoice(inv.id, inv.invoice_number)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition disabled:opacity-40">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
