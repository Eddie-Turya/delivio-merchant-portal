import { useState, useRef } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Smartphone, Link2, CheckCircle2, XCircle, Loader2, Copy, Check, Clock } from 'lucide-react'

function formatTZS(minor: number) {
  return `TZS ${minor.toLocaleString('en-TZ', { maximumFractionDigits: 0 })}`
}

// ── USSD Push Card ────────────────────────────────────────────────────────────

type UssdState = 'idle' | 'loading' | 'pending' | 'success' | 'failed'

function UssdCard() {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [state, setState] = useState<UssdState>('idle')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPoll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  async function send() {
    if (!phone.trim() || !amount) { setError('Phone and amount are required.'); return }
    const amountMinor = Math.round(parseFloat(amount))
    if (amountMinor < 200) { setError('Minimum amount is TZS 200.'); return }

    setError('')
    setState('loading')
    stopPoll()

    try {
      const res = await api.collectUssd({ phone: phone.trim(), amount_minor: amountMinor, description: desc || undefined })
      const paymentId = res.payment_id

      setState('pending')
      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts++
        if (attempts > 60) {
          stopPoll()
          setState('failed')
          setError('Timed out waiting for confirmation.')
          return
        }
        try {
          const s = await api.collectStatus(paymentId)
          const status = (s.status || '').toUpperCase()
          if (status === 'COMPLETED') {
            stopPoll()
            setSuccessMsg(`${formatTZS(amountMinor)} received from ${phone.trim()}.`)
            setState('success')
          } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') {
            stopPoll()
            setError('Payment was declined or cancelled.')
            setState('failed')
          }
        } catch (_) {}
      }, 3000)
    } catch (e: any) {
      setState('failed')
      setError(e.message || 'Failed to send USSD request.')
    }
  }

  function reset() {
    stopPoll()
    setState('idle')
    setError('')
    setSuccessMsg('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Smartphone size={18} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">USSD Push</p>
          <p className="text-xs text-gray-400">Send a payment request directly to a customer's phone</p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">

        {/* Success */}
        {state === 'success' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <p className="text-base font-bold text-gray-900">Payment confirmed</p>
            <p className="text-sm text-gray-500">{successMsg}</p>
            <button onClick={reset} className="mt-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
              New collection
            </button>
          </div>
        )}

        {/* Pending */}
        {state === 'pending' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Loader2 size={40} className="text-emerald-500 animate-spin" />
            <div>
              <p className="text-sm font-bold text-gray-900">Waiting for customer</p>
              <p className="text-xs text-gray-400 mt-1">USSD request sent to <strong>{phone}</strong>. They need to approve on their phone.</p>
            </div>
            <div className="w-full space-y-2 text-left mt-2">
              {[
                { label: 'Request sent to phone', done: true },
                { label: 'Customer sees USSD prompt', done: false },
                { label: 'Customer enters PIN', done: false },
                { label: 'Payment confirmed here', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {done ? '✓' : ''}
                  </span>
                  <span className={done ? 'text-gray-400 line-through' : 'text-gray-600'}>{label}</span>
                </div>
              ))}
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1">
              Cancel
            </button>
          </div>
        )}

        {/* Failed */}
        {state === 'failed' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <XCircle size={48} className="text-red-400" />
            <p className="text-sm font-bold text-gray-900">Payment failed</p>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={reset} className="mt-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              Try again
            </button>
          </div>
        )}

        {/* Form */}
        {(state === 'idle' || state === 'loading') && (
          <>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Customer Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amount (TZS)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="5000"
                  min="2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Description <span className="font-normal normal-case tracking-normal text-gray-300">— optional</span>
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Invoice #001"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-gray-50 placeholder:text-gray-300"
                />
              </div>
            </div>
            <button
              onClick={send}
              disabled={state === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {state === 'loading' ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : 'Send Request'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}

// ── Payment Link Card ─────────────────────────────────────────────────────────

function LinkCard() {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [expires, setExpires] = useState('24')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ url: string; amount_minor: number; description?: string; expires_at?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!amount) { setError('Amount is required.'); return }
    const amountMinor = Math.round(parseFloat(amount))
    if (amountMinor < 200) { setError('Minimum amount is TZS 200.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.createPaymentLink({
        amount_minor: amountMinor,
        description: desc || undefined,
        expires_in_hours: parseInt(expires),
      })
      setResult(res)
    } catch (e: any) {
      setError(e.message || 'Failed to generate link.')
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!result?.url) return
    navigator.clipboard.writeText(result.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function reset() {
    setResult(null)
    setError('')
    setAmount('')
    setDesc('')
    setExpires('24')
  }

  const expiryLabel: Record<string, string> = { '1': '1 hour', '6': '6 hours', '24': '24 hours', '72': '3 days', '168': '7 days' }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Link2 size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Payment Link</p>
          <p className="text-xs text-gray-400">Generate a link — the customer enters their own phone</p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
              <CheckCircle2 size={15} className="flex-shrink-0" />
              <span className="font-semibold">Link created</span>
              <span className="text-emerald-600 font-normal">· {formatTZS(result.amount_minor)}{result.description ? ` · ${result.description}` : ''}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Payment URL</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={result.url}
                  className="flex-1 min-w-0 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg bg-gray-50 text-gray-600 select-all"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={copy}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex-shrink-0 ${
                    copied
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </div>

            {result.expires_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock size={12} />
                Expires {new Date(result.expires_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            )}

            <button onClick={reset} className="w-full py-2.5 text-sm font-bold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors mt-1">
              Generate another link
            </button>
          </div>
        )}

        {/* Form */}
        {!result && (
          <>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amount (TZS)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="10000"
                  min="2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Description <span className="font-normal normal-case tracking-normal text-gray-300">— optional</span>
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="School fees · Term 2"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expires after</label>
                <select
                  value={expires}
                  onChange={e => setExpires(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                  <option value="72">3 days</option>
                  <option value="168">7 days</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Link expires in {expiryLabel[expires] || expires + ' hours'}</p>
              </div>
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : 'Generate Link'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function CollectPage() {
  return (
    <Layout>
      <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-3 bg-white border-gray-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
          <Link2 size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Collect Payment</h1>
          <p className="text-xs text-gray-400">Send a USSD push or share a payment link</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 max-w-4xl">
          <UssdCard />
          <LinkCard />
        </div>
      </div>
    </Layout>
  )
}
