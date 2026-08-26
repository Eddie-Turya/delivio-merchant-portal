import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Plus, Trash2, ArrowLeft, Save, Send, AlertCircle } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

const empty = (): LineItem => ({ description: '', quantity: 1, unit_price: 0 })

function fmt(n: number) { return Number(n).toLocaleString() }

export function InvoiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [items, setItems] = useState<LineItem[]>([empty()])
  const [taxRate, setTaxRate] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [currency] = useState('TZS')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    api.getInvoice(id!).then((inv: any) => {
      setCustomerName(inv.customer_name || '')
      setCustomerEmail(inv.customer_email || '')
      setCustomerPhone(inv.customer_phone || '')
      setItems(inv.line_items?.length ? inv.line_items : [empty()])
      setTaxRate(Number(inv.tax_rate) || 0)
      setDueDate(inv.due_date ? inv.due_date.split('T')[0] : '')
      setNotes(inv.notes || '')
    }).catch(() => navigate('/invoices'))
      .finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const setItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const subtotal = items.reduce((s, i) => s + Math.round(Number(i.unit_price) * Number(i.quantity)), 0)
  const taxAmt = Math.round(subtotal * taxRate / 100)
  const total = subtotal + taxAmt

  const payload = () => ({
    customer_name: customerName,
    customer_email: customerEmail || undefined,
    customer_phone: customerPhone || undefined,
    line_items: items.filter(i => i.description.trim()),
    tax_rate: taxRate,
    currency,
    due_date: dueDate || undefined,
    notes: notes || undefined,
  })

  const save = async (andSend = false) => {
    setError('')
    if (!customerName.trim()) { setError('Customer name is required'); return }
    const validItems = items.filter(i => i.description.trim())
    if (!validItems.length) { setError('Add at least one line item'); return }

    andSend ? setSending(true) : setSaving(true)
    try {
      let inv: any
      if (isEdit) {
        inv = await api.updateInvoice(id!, payload())
      } else {
        inv = await api.createInvoice(payload())
      }
      if (andSend) {
        inv = await api.sendInvoice(inv.id)
      }
      navigate(`/invoices/${inv.id}`)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
      setSending(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6"><div className="h-64 bg-gray-50 rounded-xl animate-pulse" /></div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/invoices')} className="text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="text-xs text-gray-400">Fill in the details and send or save as draft</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Customer Name *</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Corp" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Line Items</h2>
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-3 text-right">Unit Price ({currency})</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={item.description} onChange={e => setItem(i, 'description', e.target.value)}
                    placeholder="Description" className="col-span-5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
                  <input type="number" min="1" value={item.quantity} onChange={e => setItem(i, 'quantity', Number(e.target.value))}
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-emerald-400" />
                  <input type="number" min="0" value={item.unit_price} onChange={e => setItem(i, 'unit_price', Number(e.target.value))}
                    className="col-span-3 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-emerald-400" />
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <span className="text-xs text-gray-700 font-medium">{fmt(Math.round(item.unit_price * item.quantity))}</span>
                    {items.length > 1 && (
                      <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-300 hover:text-red-400 transition p-0.5">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => setItems(prev => [...prev, empty()])}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2 transition">
                <Plus size={13} /> Add Line Item
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{currency} {fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tax</span>
                  <input type="number" min="0" max="100" step="0.5" value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-emerald-400" />
                  <span className="text-sm text-gray-400">%</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{currency} {fmt(taxAmt)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{currency} {fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Additional Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Payment instructions, bank details, thank-you note…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 resize-none" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => save(false)} disabled={saving || sending}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition">
              <Save size={15} /> {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button onClick={() => save(true)} disabled={saving || sending}
              className="flex items-center gap-2 flex-1 justify-center bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
              <Send size={15} /> {sending ? 'Sending…' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
