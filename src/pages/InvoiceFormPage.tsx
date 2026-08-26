import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Plus, Trash2, ArrowLeft, Save, Send, AlertCircle, Eye, X, CreditCard, Phone } from 'lucide-react'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

interface PaymentDetails {
  bank_name?: string
  account_name?: string
  account_number?: string
  mobile_name?: string
  mobile_number?: string
  mobile_provider?: string
  instructions?: string
}

const empty = (): LineItem => ({ description: '', quantity: 1, unit_price: 0 })

function fmt(n: number) { return Number(n).toLocaleString() }

function InvoicePreview({ inv, merchant, onClose, onConfirm, sending }: {
  inv: any; merchant: any; onClose: () => void; onConfirm: (andSend: boolean) => void; sending: boolean
}) {
  const dueDate = inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const pd: PaymentDetails = inv.payment_details || {}
  const hasPD = pd.account_number || pd.mobile_number

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-900">Invoice Preview</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Invoice doc (scrollable) */}
        <div className="overflow-y-auto flex-1 p-6 bg-gray-50">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-xl mx-auto">
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
                <p className="text-xl font-black text-gray-900">DRAFT PREVIEW</p>
                <p className="text-xs text-gray-400 mt-1">Issued {new Date().toLocaleDateString()}</p>
                {dueDate && <p className="text-xs text-gray-500 mt-0.5">Due {dueDate}</p>}
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
                  {(inv.line_items || []).filter((i: any) => i.description.trim()).map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 text-gray-800 font-medium">{item.description}</td>
                      <td className="py-2.5 text-right text-gray-500">{item.quantity}</td>
                      <td className="py-2.5 text-right text-gray-500">{inv.currency} {fmt(item.unit_price)}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">{inv.currency} {fmt(Math.round(item.unit_price * item.quantity))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 pb-4">
              <div className="border-t border-gray-100 pt-4 space-y-1.5 max-w-xs ml-auto">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>{inv.currency} {fmt(inv.subtotal)}</span>
                </div>
                {Number(inv.tax_rate) > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax ({inv.tax_rate}%)</span><span>{inv.currency} {fmt(inv.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total Due</span><span>{inv.currency} {fmt(inv.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Payment details */}
            {hasPD && (
              <div className="px-6 pb-5">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 space-y-3">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Payment Details</p>
                  {pd.account_number && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Bank Transfer</p>
                      {pd.bank_name && <p className="text-xs text-gray-700">{pd.bank_name}</p>}
                      {pd.account_name && <p className="text-xs text-gray-700">{pd.account_name}</p>}
                      <p className="text-xs font-mono font-bold text-gray-900">{pd.account_number}</p>
                    </div>
                  )}
                  {pd.mobile_number && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Mobile Money {pd.mobile_provider && `(${pd.mobile_provider})`}</p>
                      {pd.mobile_name && <p className="text-xs text-gray-700">{pd.mobile_name}</p>}
                      <p className="text-xs font-mono font-bold text-gray-900">{pd.mobile_number}</p>
                    </div>
                  )}
                  {pd.instructions && <p className="text-xs text-gray-600 italic">{pd.instructions}</p>}
                </div>
              </div>
            )}

            {inv.notes && (
              <div className="px-6 pb-5">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{inv.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={() => onConfirm(false)} disabled={sending}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition">
            <Save size={15} /> Save Draft
          </button>
          <button onClick={() => onConfirm(true)} disabled={sending}
            className="flex items-center gap-2 flex-1 justify-center bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
            <Send size={15} /> {sending ? 'Sending…' : 'Send Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function InvoiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'
  const merchant = JSON.parse(localStorage.getItem('portalMerchant') || '{}')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [items, setItems] = useState<LineItem[]>([empty()])
  const [taxRate, setTaxRate] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [currency] = useState('TZS')

  // Payment details
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [mobileName, setMobileName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [mobileProvider, setMobileProvider] = useState('')
  const [payInstructions, setPayInstructions] = useState('')

  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [showPreview, setShowPreview] = useState(false)

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
      const pd: PaymentDetails = inv.payment_details || {}
      setBankName(pd.bank_name || '')
      setAccountName(pd.account_name || '')
      setAccountNumber(pd.account_number || '')
      setMobileName(pd.mobile_name || '')
      setMobileNumber(pd.mobile_number || '')
      setMobileProvider(pd.mobile_provider || '')
      setPayInstructions(pd.instructions || '')
    }).catch(() => navigate('/invoices'))
      .finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const setItem = (i: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const subtotal = items.reduce((s, i) => s + Math.round(Number(i.unit_price) * Number(i.quantity)), 0)
  const taxAmt = Math.round(subtotal * taxRate / 100)
  const total = subtotal + taxAmt

  const buildPaymentDetails = (): PaymentDetails | undefined => {
    const pd: PaymentDetails = {}
    if (bankName) pd.bank_name = bankName
    if (accountName) pd.account_name = accountName
    if (accountNumber) pd.account_number = accountNumber
    if (mobileName) pd.mobile_name = mobileName
    if (mobileNumber) pd.mobile_number = mobileNumber
    if (mobileProvider) pd.mobile_provider = mobileProvider
    if (payInstructions) pd.instructions = payInstructions
    return Object.keys(pd).length ? pd : undefined
  }

  const payload = () => ({
    customer_name: customerName,
    customer_email: customerEmail || undefined,
    customer_phone: customerPhone || undefined,
    line_items: items.filter(i => i.description.trim()),
    tax_rate: taxRate,
    currency,
    due_date: dueDate || undefined,
    notes: notes || undefined,
    payment_details: buildPaymentDetails(),
  })

  const validate = () => {
    if (!customerName.trim()) { setError('Customer name is required'); return false }
    const validItems = items.filter(i => i.description.trim())
    if (!validItems.length) { setError('Add at least one line item'); return false }
    setError('')
    return true
  }

  const openPreview = () => {
    if (!validate()) return
    setShowPreview(true)
  }

  const save = async (andSend = false) => {
    if (!validate()) return
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

  const previewInv = {
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    line_items: items,
    tax_rate: taxRate,
    tax_amount: taxAmt,
    subtotal,
    total_amount: total,
    currency,
    due_date: dueDate,
    notes,
    payment_details: buildPaymentDetails(),
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
      {showPreview && (
        <InvoicePreview
          inv={previewInv}
          merchant={merchant}
          onClose={() => setShowPreview(false)}
          onConfirm={(andSend) => { setShowPreview(false); save(andSend) }}
          sending={sending}
        />
      )}

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

          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold text-gray-900">Payment Details</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Optional</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Bank or mobile money info shown on the invoice so customers know where to send money.</p>

            <div className="space-y-5">
              {/* Bank */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={14} className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Bank Transfer</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Bank Name</label>
                    <input value={bankName} onChange={e => setBankName(e.target.value)}
                      placeholder="e.g. CRDB Bank" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Account Name</label>
                    <input value={accountName} onChange={e => setAccountName(e.target.value)}
                      placeholder="Business name on account" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Account Number</label>
                    <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                      placeholder="e.g. 0150123456789" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Mobile Money */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Phone size={14} className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Mobile Money</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Provider</label>
                    <select value={mobileProvider} onChange={e => setMobileProvider(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 bg-white">
                      <option value="">Select…</option>
                      <option>M-Pesa</option>
                      <option>Tigo Pesa</option>
                      <option>Airtel Money</option>
                      <option>Halopesa</option>
                      <option>T-Pesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Name on Account</label>
                    <input value={mobileName} onChange={e => setMobileName(e.target.value)}
                      placeholder="Account holder name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mobile Number</label>
                    <input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
                      placeholder="+255 7XX XXX XXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-400" />
                  </div>
                </div>
              </div>

              {(bankName || accountNumber || mobileNumber) && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Additional Instructions</label>
                  <input value={payInstructions} onChange={e => setPayInstructions(e.target.value)}
                    placeholder="e.g. Use invoice number as payment reference"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
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
                  placeholder="Additional notes for the customer…"
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
            <button onClick={openPreview} disabled={saving || sending}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
              <Eye size={15} /> Preview
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
