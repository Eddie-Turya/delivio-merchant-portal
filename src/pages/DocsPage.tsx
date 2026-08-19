import { useState } from 'react'
import { Layout } from '../components/Layout'
import { BookOpen, ChevronRight, Copy, Check, Terminal, Zap, Key, Webhook, RefreshCw, AlertCircle } from 'lucide-react'

function useClipboard() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }
  return { copied, copy }
}

function CodeBlock({ id, code, lang = 'bash' }: { id: string; code: string; lang?: string }) {
  const { copied, copy } = useClipboard()
  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 border-b border-slate-700/40">
        <span className="text-xs font-mono text-slate-400">{lang}</span>
        <button
          onClick={() => copy(code, id)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied === id ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
    </div>
  )
}

function Badge({ text, color }: { text: string; color: 'green' | 'blue' | 'orange' | 'red' | 'slate' }) {
  const colors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    orange: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    slate: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border font-mono ${colors[color]}`}>
      {text}
    </span>
  )
}

function Param({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-slate-800/60 last:border-0">
      <div className="w-40 flex-shrink-0">
        <code className="text-sm text-emerald-300">{name}</code>
        {required && <span className="ml-1.5 text-[10px] text-red-400 font-semibold uppercase tracking-wide">req</span>}
      </div>
      <div className="w-24 flex-shrink-0">
        <span className="text-xs font-mono text-slate-400">{type}</span>
      </div>
      <div className="flex-1 text-sm text-slate-300">{desc}</div>
    </div>
  )
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'auth', label: 'Authentication' },
  { id: 'sandbox', label: 'Sandbox' },
  { id: 'create-payment', label: 'Create Payment' },
  { id: 'get-payment', label: 'Get Payment' },
  { id: 'list-payments', label: 'List Payments' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'errors', label: 'Errors' },
]

export function DocsPage() {
  const [active, setActive] = useState('overview')

  return (
    <Layout>
      <div className="flex h-full min-h-screen">
        {/* Sidebar nav */}
        <nav className="hidden md:block w-52 flex-shrink-0 border-r border-slate-800/60 py-6 pr-2">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">API Reference</p>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActive(s.id)
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors mb-0.5 ${
                active === s.id
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ChevronRight size={12} className={active === s.id ? 'text-emerald-400' : 'text-slate-600'} />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <div className="flex-1 p-6 md:p-8 max-w-3xl space-y-16 overflow-y-auto">

          {/* Overview */}
          <section id="overview">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BookOpen size={16} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Delivio Pay API</h1>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              The Delivio Pay API lets you accept mobile money payments (M-Pesa, Tigo Pesa, Airtel Money, Halopesa) from your customers.
              The API is RESTful, returns JSON, and uses Bearer token authentication.
            </p>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-slate-800/40 px-4 py-3 border-b border-slate-700/40">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Base URL</p>
              </div>
              <div className="px-4 py-3">
                <code className="text-emerald-300 font-mono text-sm">https://pay.deliviosend.com</code>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="auth">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Key size={16} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Authentication</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              All requests must include your API key as a Bearer token in the <code className="text-emerald-300">Authorization</code> header.
              Use your <strong className="text-white">live key</strong> for real payments and your <strong className="text-white">sandbox key</strong> for testing.
            </p>
            <CodeBlock id="auth-header" lang="http" code={`POST /v1/payments HTTP/1.1
Host: pay.deliviosend.com
Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json`} />
            <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                Never expose your API key in client-side code or version control. Rotate it immediately from the API Keys page if compromised.
              </p>
            </div>
          </section>

          {/* Sandbox */}
          <section id="sandbox">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Terminal size={16} className="text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Sandbox</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              Use your <code className="text-emerald-300">dpay_test_</code> key to make sandbox payments. Sandbox payments are processed
              instantly with a simulated <Badge text="COMPLETED" color="green" /> status — no real money moves, no USSD prompt is sent.
              All sandbox data is isolated from your live transactions.
            </p>
            <CodeBlock id="sandbox-example" lang="bash" code={`curl -X POST https://pay.deliviosend.com/v1/payments \\
  -H "Authorization: Bearer dpay_test_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_minor": 5000,
    "currency": "TZS",
    "merchant_reference": "test-order-001",
    "phone_number": "255712000000"
  }'`} />
            <div className="mt-4 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-700/40 text-xs font-semibold text-slate-400 uppercase tracking-wide">Sandbox behaviour</div>
              <div className="divide-y divide-slate-800/60">
                {[
                  ['Payment created', 'Immediately transitions to COMPLETED'],
                  ['Webhook fired', 'payment.completed event sent to your webhook URL'],
                  ['Phone number', 'Any valid format accepted — no USSD push sent'],
                  ['Currency', 'TZS only (min 200)'],
                ].map(([k, v]) => (
                  <div key={k} className="flex px-4 py-3 gap-4 text-sm">
                    <span className="w-40 flex-shrink-0 text-slate-400">{k}</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Create Payment */}
          <section id="create-payment">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Create a Payment</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Badge text="POST" color="green" />
              <code className="text-sm font-mono text-slate-200">/v1/payments</code>
            </div>
            <p className="text-slate-300 leading-relaxed mb-5">
              Initiates a mobile money payment. The customer receives a USSD push notification to approve the payment.
              The payment starts in <Badge text="CREATED" color="slate" /> state and transitions to <Badge text="COMPLETED" color="green" /> or <Badge text="FAILED" color="red" /> asynchronously.
            </p>

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">Request Parameters</h3>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden mb-6">
              <Param name="amount_minor" type="integer" required desc="Amount in smallest currency unit. For TZS: minimum 200." />
              <Param name="currency" type="string" required desc='ISO-4217 currency code. Currently "TZS" only.' />
              <Param name="merchant_reference" type="string" required desc="Your unique order/reference ID. Must be unique per environment." />
              <Param name="phone_number" type="string" desc="Customer phone in international format (e.g. 255712345678). Required for USSD push." />
            </div>

            <CodeBlock id="create-request" lang="bash" code={`curl -X POST https://pay.deliviosend.com/v1/payments \\
  -H "Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-123-attempt-1" \\
  -d '{
    "amount_minor": 10000,
    "currency": "TZS",
    "merchant_reference": "order-123",
    "phone_number": "255712345678"
  }'`} />

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mt-6 mb-3">Response</h3>
            <CodeBlock id="create-response" lang="json" code={`{
  "id": "pay_a1b2c3d4-...",
  "object": "payment",
  "status": "CREATED",
  "amount_minor": 10000,
  "currency": "TZS",
  "merchant_reference": "order-123",
  "refunded_amount_minor": 0,
  "created_at": "2026-08-19T09:00:00.000Z",
  "updated_at": "2026-08-19T09:00:00.000Z"
}`} />

            <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <p className="text-sm font-semibold text-white mb-1">Idempotency</p>
              <p className="text-sm text-slate-300">Pass an <code className="text-emerald-300">Idempotency-Key</code> header to safely retry requests. Repeated requests with the same key return the original response without creating a duplicate payment.</p>
            </div>
          </section>

          {/* Get Payment */}
          <section id="get-payment">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <RefreshCw size={16} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Get a Payment</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Badge text="GET" color="blue" />
              <code className="text-sm font-mono text-slate-200">/v1/payments/:id</code>
            </div>
            <p className="text-slate-300 leading-relaxed mb-5">
              Retrieve the current state of a payment. Poll this endpoint to check if an async payment has completed.
            </p>
            <CodeBlock id="get-request" lang="bash" code={`curl https://pay.deliviosend.com/v1/payments/pay_a1b2c3d4-... \\
  -H "Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx"`} />

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mt-5 mb-3">Payment Statuses</h3>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden">
              {[
                ['CREATED', 'slate', 'Payment accepted, awaiting provider initiation'],
                ['PENDING', 'orange', 'USSD push sent, waiting for customer to approve'],
                ['COMPLETED', 'green', 'Payment confirmed and settled'],
                ['FAILED', 'red', 'Payment failed — customer declined or timed out'],
                ['CANCELLED', 'slate', 'Payment cancelled before completion'],
                ['REFUNDED', 'blue', 'Full refund issued'],
              ].map(([status, color, desc]) => (
                <div key={status} className="flex items-center gap-4 px-4 py-3 border-b border-slate-800/60 last:border-0 text-sm">
                  <div className="w-28 flex-shrink-0"><Badge text={status} color={color as any} /></div>
                  <span className="text-slate-300">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* List Payments */}
          <section id="list-payments">
            <h2 className="text-xl font-bold text-white mb-3">List Payments</h2>
            <div className="flex items-center gap-3 mb-4">
              <Badge text="GET" color="blue" />
              <code className="text-sm font-mono text-slate-200">/v1/payments</code>
            </div>
            <p className="text-slate-300 leading-relaxed mb-5">Returns a paginated list of payments for your environment.</p>

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">Query Parameters</h3>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden mb-5">
              <Param name="limit" type="integer" desc="Number of results (default 25, max 100)." />
              <Param name="offset" type="integer" desc="Offset for pagination (default 0)." />
            </div>
            <CodeBlock id="list-request" lang="bash" code={`curl "https://pay.deliviosend.com/v1/payments?limit=10&offset=0" \\
  -H "Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx"`} />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mt-5 mb-3">Response</h3>
            <CodeBlock id="list-response" lang="json" code={`{
  "object": "list",
  "data": [ /* array of payment objects */ ],
  "has_more": true,
  "next_cursor": 10
}`} />
          </section>

          {/* Webhooks */}
          <section id="webhooks">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Webhook size={16} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Webhooks</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-5">
              Delivio Pay sends HTTPS POST requests to your endpoint when payment events occur.
              Configure your webhook URL from the Webhooks page in this portal.
            </p>

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">Events</h3>
            <div className="rounded-xl border border-slate-700/50 overflow-hidden mb-6">
              {[
                ['payment.completed', 'Payment was successfully collected'],
                ['payment.failed', 'Payment failed or customer declined'],
                ['payment.pending', 'USSD push sent, awaiting customer action'],
                ['refund.created', 'Refund was initiated'],
                ['refund.completed', 'Refund was settled to customer'],
              ].map(([event, desc]) => (
                <div key={event} className="flex items-start gap-4 px-4 py-3 border-b border-slate-800/60 last:border-0 text-sm">
                  <code className="w-44 flex-shrink-0 text-emerald-300 font-mono text-xs">{event}</code>
                  <span className="text-slate-300">{desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">Payload</h3>
            <CodeBlock id="webhook-payload" lang="json" code={`{
  "event": "payment.completed",
  "created_at": "2026-08-19T09:05:12.000Z",
  "data": {
    "id": "pay_a1b2c3d4-...",
    "object": "payment",
    "status": "COMPLETED",
    "amount_minor": 10000,
    "currency": "TZS",
    "merchant_reference": "order-123"
  }
}`} />

            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mt-6 mb-3">Verifying Signatures</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Each webhook request includes an <code className="text-emerald-300">X-Delivio-Signature</code> header — an HMAC-SHA256
              of the raw request body signed with your webhook secret. Always verify this before processing.
            </p>
            <CodeBlock id="webhook-verify" lang="javascript" code={`const crypto = require('crypto')

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  )
}

// In your Express handler:
app.post('/webhooks/deliviopay', (req, res) => {
  const sig = req.headers['x-delivio-signature']
  if (!verifyWebhook(req.rawBody, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(400).send('Invalid signature')
  }
  const { event, data } = req.body
  if (event === 'payment.completed') {
    // fulfil the order
  }
  res.sendStatus(200)
})`} />
          </section>

          {/* Errors */}
          <section id="errors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={16} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Errors</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-5">
              All errors return a JSON body with an <code className="text-emerald-300">error</code> object.
            </p>
            <CodeBlock id="error-example" lang="json" code={`{
  "error": {
    "type": "validation_error",
    "code": "amount_too_small",
    "message": "amount_minor must be at least 200 for TZS payments",
    "param": "amount_minor",
    "request_id": "req_abc123"
  }
}`} />
            <div className="mt-5 rounded-xl border border-slate-700/50 overflow-hidden">
              {[
                ['400', 'orange', 'Bad Request — validation_error or missing required fields'],
                ['401', 'red', 'Unauthorized — invalid or missing API key'],
                ['404', 'slate', 'Not Found — payment ID does not exist'],
                ['409', 'orange', 'Conflict — duplicate merchant_reference'],
                ['429', 'orange', 'Rate Limited — slow down requests'],
                ['500', 'red', 'Internal Error — contact support'],
              ].map(([code, color, desc]) => (
                <div key={code} className="flex items-start gap-4 px-4 py-3 border-b border-slate-800/60 last:border-0 text-sm">
                  <div className="w-12 flex-shrink-0"><Badge text={code} color={color as any} /></div>
                  <span className="text-slate-300">{desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <p className="text-sm font-semibold text-white mb-1">Support</p>
              <p className="text-sm text-slate-300">
                Questions or integration issues? Contact <a href="mailto:support@deliviosend.com" className="text-emerald-400 hover:underline">support@deliviosend.com</a> with your <code className="text-emerald-300">request_id</code>.
              </p>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  )
}
