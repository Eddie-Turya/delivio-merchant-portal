import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { ArrowLeft, Copy, ExternalLink, Send, CheckCircle2, Edit2, Trash2, Clock, AlertCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  DRAFT:    { label: 'Draft',    bg: 'bg-gray-100',    text: 'text-gray-600' },
  SENT:     { label: 'Sent',     bg: 'bg-blue-100',    text: 'text-blue-700' },
  PAID:     { label: 'Paid',     bg: 'bg-emerald-100', text: 'text-emerald-700' },
  OVERDUE:  { label: 'Overdue',  bg: 'bg-red-100',     text: 'text-red-600' },
  CANCELLED:{ label: 'Cancelled',bg: 'bg-gray-100',    text: 'text-gray-400' },
}

function fmt(n: number, currency = 'TZS') { return `${currency} ${Number(n).toLocaleString()}` }

export function InvoiceDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [inv, setInv] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.getInvoice(id!)
      .then(setInv)
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const copyLink = () => {
    navigator.clipboard.writeText(inv.payment_link_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const send = async () => {
    setActing(true)
    try { setInv(await api.sendInvoice(id!)) }
    catch (e: any) { alert(e.message) }
    finally { setActing(false) }
  }

  const markPaid = async () => {
    setActing(true)
    try { setInv(await api.markInvoicePaid(id!)) }
    catch (e: any) { alert(e.message) }
    finally { setActing(false) }
  }

  const deleteInv = async () => {
    if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return
    setActing(true)
    try { await api.deleteInvoice(id!); navigate('/invoices') }
    catch (e: any) { alert(e.message); setActing(false) }
  }

  if (loading) return <Layout><div className="p-6"><div className="h-96 bg-gray-50 rounded-xl animate-pulse" /></div></Layout>
  if (!inv) return null

  const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.DRAFT
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')
  const dueDate = inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">{inv.invoice_number}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
            </div>
            <p className="text-xs text-gray-400">{inv.customer_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {inv.status === 'DRAFT' && (
            <>
              <button onClick={() => navigate(`/invoices/${id}/edit`)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={send} disabled={acting} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white px-3 py-2 rounded-lg text-sm font-semibold transition">
                <Send size={13} /> Send
              </button>
              <button onClick={deleteInv} disabled={acting} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
                <Trash2 size={15} />
              </button>
            </>
          )}
          {['SENT','OVERDUE'].includes(inv.status) && (
            <>
              {inv.payment_link_url && (
                <>
                  <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                    {copied ? <><CheckCircle2 size={13} className="text-emerald-500" /> Copied!</> : <><Copy size={13} /> Copy Link</>}
                  </button>
                  <a href={inv.payment_link_url} target="_blank" rel="noreferrer"
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                    <ExternalLink size={15} />
                  </a>
                </>
              )}
              <button onClick={markPaid} disabled={acting}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white px-3 py-2 rounded-lg text-sm font-semibold transition">
                <CheckCircle2 size={13} /> Mark Paid
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Payment link banner */}
          {inv.payment_link_url && inv.status !== 'PAID' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-700 mb-0.5">Payment Link</p>
                <p className="text-xs text-blue-600 truncate">{inv.payment_link_url}</p>
              </div>
              <button onClick={copyLink} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                {copied ? <><CheckCircle2 size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          )}

          {inv.status === 'PAID' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Invoice Paid</p>
                {inv.paid_at && <p className="text-xs text-emerald-600">{new Date(inv.paid_at).toLocaleString()}</p>}
              </div>
            </div>
          )}

          {inv.status === 'OVERDUE' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-600">This invoice is overdue — follow up with {inv.customer_name}</p>
            </div>
          )}

          {/* Invoice document */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{merchant.name || 'Delivio Pay'}</p>
                <p className="text-xs text-gray-400">{merchant.slug}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">{inv.invoice_number}</p>
                <p className="text-xs text-gray-400 mt-1">Issued {new Date(inv.created_at).toLocaleDateString()}</p>
                {dueDate && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Clock size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-500">Due {dueDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bill to */}
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/40">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
              <p className="text-sm font-bold text-gray-900">{inv.customer_name}</p>
              {inv.customer_email && <p className="text-xs text-gray-500">{inv.customer_email}</p>}
              {inv.customer_phone && <p className="text-xs text-gray-500">{inv.customer_phone}</p>}
            </div>

            {/* Line items */}
            <div className="px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 text-left">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(inv.line_items || []).map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 text-gray-800 font-medium">{item.description}</td>
                      <td className="py-2.5 text-right text-gray-500">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-500">{inv.currency} {Number(item.unit_price).toLocaleString()}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">{inv.currency} {Math.round(Number(item.unit_price) * Number(item.quantity)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 pb-6">
              <div className="border-t border-gray-100 pt-4 space-y-1.5 max-w-xs ml-auto">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{fmt(inv.subtotal, inv.currency)}</span>
                </div>
                {Number(inv.tax_rate) > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax ({inv.tax_rate}%)</span>
                    <span>{fmt(inv.tax_amount, inv.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <span>Total Due</span>
                  <span>{fmt(inv.total_amount, inv.currency)}</span>
                </div>
              </div>
            </div>

            {inv.notes && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{inv.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
