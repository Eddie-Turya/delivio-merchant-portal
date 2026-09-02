import { useState, useEffect, useRef } from 'react'
import { Layout } from '../components/Layout'
import { Copy, Check, AlertTriangle, Info, Zap, Key, FlaskConical, Webhook, AlertCircle, BookOpen } from 'lucide-react'

/* ─── Clipboard hook ─────────────────────────────────────────── */
function useClipboard() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }
  return { copied, copy }
}

/* ─── Code block ─────────────────────────────────────────────── */
function CodeBlock({ id, code, lang = 'bash' }: { id: string; code: string; lang?: string }) {
  const { copied, copy } = useClipboard()
  const langLabel: Record<string, string> = {
    bash: 'Shell', json: 'JSON', javascript: 'JavaScript', http: 'HTTP',
  }
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-900/10 shadow-sm">
      <div className="flex items-center justify-between bg-gray-950 px-5 py-2.5 border-b border-white/[0.06]">
        <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">{langLabel[lang] ?? lang}</span>
        <button
          onClick={() => copy(code, id)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-200 transition-colors"
        >
          {copied === id
            ? <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></>
            : <><Copy size={11} /> Copy</>}
        </button>
      </div>
      <pre className="bg-[#0d1117] p-5 text-[13px] font-mono text-gray-300 overflow-x-auto leading-relaxed whitespace-pre">{code}</pre>
    </div>
  )
}

/* ─── Method badge ───────────────────────────────────────────── */
function MethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    POST: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    GET:  'bg-blue-50 text-blue-700 border-blue-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
    PATCH: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border font-mono ${styles[method] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {method}
    </span>
  )
}

/* ─── Status badge ───────────────────────────────────────────── */
function StatusBadge({ text, variant = 'neutral' }: { text: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' }) {
  const v: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error:   'bg-red-50 text-red-700 border-red-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border font-mono ${v[variant]}`}>
      {text}
    </span>
  )
}

/* ─── Endpoint header ────────────────────────────────────────── */
function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
      <MethodBadge method={method} />
      <code className="text-sm font-mono text-gray-700 font-medium">{path}</code>
    </div>
  )
}

/* ─── Param row ──────────────────────────────────────────────── */
function Param({ name, type, required, children }: { name: string; type: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[180px_100px_1fr] gap-x-4 gap-y-1 py-3.5 border-b border-gray-100 last:border-0 text-sm">
      <div className="flex items-center gap-2">
        <code className="text-[13px] font-mono font-semibold text-gray-800">{name}</code>
        {required && <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded uppercase tracking-wide">required</span>}
      </div>
      <span className="text-xs font-mono text-gray-400 self-center">{type}</span>
      <p className="text-gray-500 col-span-2 sm:col-span-1 mt-1 sm:mt-0">{children}</p>
    </div>
  )
}

/* ─── Callout ────────────────────────────────────────────────── */
function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const cfg = {
    info:    { bg: 'bg-blue-50 border-blue-200',   icon: <Info size={15} className="text-blue-500" />,        text: 'text-blue-800' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle size={15} className="text-amber-500" />, text: 'text-amber-800' },
    tip:     { bg: 'bg-emerald-50 border-emerald-200', icon: <Zap size={15} className="text-emerald-500" />,   text: 'text-emerald-800' },
  }[type]
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${cfg.bg}`}>
      <span className="flex-shrink-0 mt-0.5">{cfg.icon}</span>
      <p className={`text-sm leading-relaxed ${cfg.text}`}>{children}</p>
    </div>
  )
}

/* ─── Section heading ────────────────────────────────────────── */
function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-gray-900">{children}</h2>
    </div>
  )
}

/* ─── Nav sections ───────────────────────────────────────────── */
const SECTIONS = [
  { id: 'overview',       label: 'Overview',        group: null },
  { id: 'auth',          label: 'Authentication',   group: null },
  { id: 'sandbox',       label: 'Sandbox',          group: null },
  { id: 'create-payment', label: 'Create Payment',  group: 'Endpoints' },
  { id: 'get-payment',   label: 'Get Payment',      group: 'Endpoints' },
  { id: 'list-payments', label: 'List Payments',    group: 'Endpoints' },
  { id: 'webhooks',      label: 'Webhooks',         group: null },
  { id: 'errors',        label: 'Errors',           group: null },
]

/* ─── Page ───────────────────────────────────────────────────── */
export function DocsPage() {
  const [active, setActive] = useState('overview')
  const [navOpen, setNavOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) {
          const top = visible.reduce((a, b) => a.boundingClientRect.top < b.boundingClientRect.top ? a : b)
          setActive(top.target.id)
        }
      },
      { root: el, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    SECTIONS.forEach(s => {
      const node = document.getElementById(s.id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setNavOpen(false)
  }

  const grouped = SECTIONS.reduce<{ label: string | null; items: typeof SECTIONS }[]>((acc, s) => {
    const last = acc[acc.length - 1]
    if (!last || last.label !== s.group) {
      acc.push({ label: s.group, items: [s] })
    } else {
      last.items.push(s)
    }
    return acc
  }, [])

  const navContent = (
    <div className="py-6">
      <p className="px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">API Reference</p>
      {grouped.map((g, i) => (
        <div key={i} className="mb-4">
          {g.label && (
            <p className="px-5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{g.label}</p>
          )}
          {g.items.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full text-left px-5 py-2 text-sm transition-colors flex items-center gap-2 ${
                active === s.id
                  ? 'text-emerald-600 font-semibold bg-emerald-50 border-r-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <Layout>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <BookOpen size={16} className="text-gray-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">API Reference</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Wisopay · REST API</p>
          </div>
        </div>
        {/* Mobile nav toggle */}
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="lg:hidden flex items-center gap-2 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          {navOpen ? 'Close' : 'Sections'}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {navOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-md z-10">
          {navContent}
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop left nav */}
        <aside className="hidden lg:block w-52 xl:w-60 flex-shrink-0 sticky top-[65px] self-start max-h-[calc(100vh-65px)] overflow-y-auto border-r border-gray-100">
          {navContent}
        </aside>

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0 px-5 sm:px-8 xl:px-12 py-10 max-w-3xl">
          <div className="space-y-20">

            {/* ── Overview ── */}
            <section id="overview">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-4">
                  <Zap size={11} />
                  REST API v1
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Wisopay API</h1>
                <p className="text-base text-gray-500 leading-relaxed">
                  Accept mobile money payments — M-Pesa, Tigo Pesa, Airtel Money, and Halopesa — directly from your app or backend.
                  The API is RESTful, returns JSON, and uses Bearer token authentication.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Base URL</span>
                </div>
                <div className="px-5 py-4 bg-white">
                  <code className="text-sm font-mono font-semibold text-gray-800">https://wisopay.io</code>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Protocol', value: 'HTTPS only' },
                  { label: 'Format', value: 'JSON' },
                  { label: 'Auth', value: 'Bearer token' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Authentication ── */}
            <section id="auth">
              <SectionHeading icon={<Key size={17} className="text-gray-600" />}>
                Authentication
              </SectionHeading>
              <p className="text-gray-500 leading-relaxed mb-5">
                Include your API key as a Bearer token in every request. Use your <strong className="text-gray-800 font-semibold">live key</strong> (<code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">dpay_live_</code>) for production and your <strong className="text-gray-800 font-semibold">sandbox key</strong> (<code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">dpay_test_</code>) for testing.
              </p>
              <CodeBlock id="auth-header" lang="http" code={`POST /v1/payments HTTP/1.1
Host: wisopay.io
Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json`} />
              <div className="mt-4">
                <Callout type="warning">
                  Never expose your API key in client-side code or version control. If compromised, rotate it immediately from the API Keys page — the old key is invalidated instantly.
                </Callout>
              </div>
            </section>

            {/* ── Sandbox ── */}
            <section id="sandbox">
              <SectionHeading icon={<FlaskConical size={17} className="text-gray-600" />}>
                Sandbox
              </SectionHeading>
              <p className="text-gray-500 leading-relaxed mb-5">
                Use your <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">dpay_test_</code> key to test your integration without moving real money.
                Sandbox payments complete instantly and fire real webhook events — no USSD push is sent to any phone.
              </p>
              <CodeBlock id="sandbox-example" lang="bash" code={`curl -X POST https://api.wisopay.io/v1/payments \\
  -H "Authorization: Bearer dpay_test_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_minor": 5000,
    "currency": "TZS",
    "merchant_reference": "test-order-001",
    "phone_number": "255712000000"
  }'`} />
              <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sandbox behaviour</span>
                </div>
                {[
                  ['Payment status', 'Immediately set to COMPLETED'],
                  ['Webhooks', 'payment.completed fired to your webhook URL'],
                  ['Phone number', 'Any valid format accepted — no USSD push sent'],
                  ['Data isolation', 'Sandbox payments are separate from live transactions'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0 bg-white">
                    <span className="sm:w-44 text-sm font-medium text-gray-500 flex-shrink-0">{k}</span>
                    <span className="text-sm text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Create Payment ── */}
            <section id="create-payment">
              <SectionHeading icon={<Zap size={17} className="text-gray-600" />}>
                Create a Payment
              </SectionHeading>
              <Endpoint method="POST" path="/v1/payments" />
              <p className="text-gray-500 leading-relaxed mb-6">
                Initiates a mobile money payment request. The customer receives a USSD push to approve.
                The payment starts as <StatusBadge text="CREATED" variant="neutral" /> and resolves to <StatusBadge text="COMPLETED" variant="success" /> or <StatusBadge text="FAILED" variant="error" /> asynchronously — use webhooks or poll <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">GET /v1/payments/:id</code> to confirm.
              </p>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Request parameters</h3>
              <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6 bg-white">
                <Param name="amount_minor" type="integer" required>Amount in the smallest currency unit. For TZS: minimum <strong>200</strong>.</Param>
                <Param name="currency" type="string" required>ISO-4217 currency code. Currently <code className="font-mono text-xs bg-gray-100 px-1 rounded">TZS</code> only.</Param>
                <Param name="merchant_reference" type="string" required>Your unique order/reference ID — must be unique per environment.</Param>
                <Param name="phone_number" type="string">Customer's phone in international format (e.g. <code className="font-mono text-xs bg-gray-100 px-1 rounded">255712345678</code>). Required for live USSD push.</Param>
              </div>

              <CodeBlock id="create-request" lang="bash" code={`curl -X POST https://api.wisopay.io/v1/payments \\
  -H "Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-123-attempt-1" \\
  -d '{
    "amount_minor": 10000,
    "currency": "TZS",
    "merchant_reference": "order-123",
    "phone_number": "255712345678"
  }'`} />

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-7 mb-3">Response</h3>
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

              <div className="mt-5">
                <Callout type="tip">
                  <strong>Idempotency</strong> — pass an <code className="font-mono text-xs bg-emerald-100 px-1 rounded">Idempotency-Key</code> header to safely retry requests. Repeated calls with the same key return the original response without creating a duplicate payment.
                </Callout>
              </div>
            </section>

            {/* ── Get Payment ── */}
            <section id="get-payment">
              <SectionHeading icon={<Key size={17} className="text-gray-600" />}>
                Get a Payment
              </SectionHeading>
              <Endpoint method="GET" path="/v1/payments/:id" />
              <p className="text-gray-500 leading-relaxed mb-6">
                Retrieve the current state of a payment. Use this to poll for status changes or to verify a completed transaction.
              </p>
              <CodeBlock id="get-request" lang="bash" code={`curl https://api.wisopay.io/v1/payments/pay_a1b2c3d4-... \\
  -H "Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx"`} />

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-7 mb-3">Payment statuses</h3>
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                {([
                  ['CREATED',   'neutral', 'Payment accepted, awaiting provider initiation'],
                  ['PENDING',   'warning', 'USSD push sent, waiting for customer approval'],
                  ['COMPLETED', 'success', 'Payment confirmed and settled'],
                  ['FAILED',    'error',   'Customer declined or request timed out'],
                  ['CANCELLED', 'neutral', 'Payment cancelled before completion'],
                  ['REFUNDED',  'info',    'Full refund issued to customer'],
                ] as const).map(([status, variant, desc]) => (
                  <div key={status} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
                    <div className="sm:w-32 flex-shrink-0"><StatusBadge text={status} variant={variant} /></div>
                    <span className="text-sm text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── List Payments ── */}
            <section id="list-payments">
              <SectionHeading icon={<BookOpen size={17} className="text-gray-600" />}>
                List Payments
              </SectionHeading>
              <Endpoint method="GET" path="/v1/payments" />
              <p className="text-gray-500 leading-relaxed mb-6">Returns a paginated list of all payments for your environment.</p>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Query parameters</h3>
              <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6 bg-white">
                <Param name="limit" type="integer">Number of results to return. Default <code className="font-mono text-xs bg-gray-100 px-1 rounded">25</code>, max <code className="font-mono text-xs bg-gray-100 px-1 rounded">100</code>.</Param>
                <Param name="offset" type="integer">Pagination offset. Default <code className="font-mono text-xs bg-gray-100 px-1 rounded">0</code>.</Param>
              </div>

              <CodeBlock id="list-request" lang="bash" code={`curl "https://api.wisopay.io/v1/payments?limit=10&offset=0" \\
  -H "Authorization: Bearer dpay_live_xxxxxxxxxxxxxxxxxxxx"`} />

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-7 mb-3">Response</h3>
              <CodeBlock id="list-response" lang="json" code={`{
  "object": "list",
  "data": [ /* array of payment objects */ ],
  "has_more": true,
  "next_cursor": 10
}`} />
            </section>

            {/* ── Webhooks ── */}
            <section id="webhooks">
              <SectionHeading icon={<Webhook size={17} className="text-gray-600" />}>
                Webhooks
              </SectionHeading>
              <p className="text-gray-500 leading-relaxed mb-6">
                Wisopay sends <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">HTTPS POST</code> requests to your endpoint when payment events occur.
                Configure your webhook URL from the Webhooks page in this portal.
              </p>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Events</h3>
              <div className="rounded-2xl border border-gray-200 overflow-hidden mb-6 bg-white">
                {[
                  ['payment.completed', 'Payment was successfully collected'],
                  ['payment.failed',    'Payment failed or customer declined'],
                  ['payment.pending',   'USSD push sent, awaiting customer action'],
                  ['refund.created',    'Refund was initiated'],
                  ['refund.completed',  'Refund was settled to the customer'],
                ].map(([event, desc]) => (
                  <div key={event} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
                    <code className="sm:w-44 flex-shrink-0 text-[12px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">{event}</code>
                    <span className="text-sm text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payload</h3>
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

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-8 mb-3">Signing secret</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                When you create a webhook, a signing secret (<code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">whsec_...</code>) is generated and shown <strong className="text-gray-800 font-semibold">once</strong>.
                Store it securely — subsequent API responses only return the first 14 characters (<code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">secret_prefix</code>) so you can identify which secret is active without exposing it.
              </p>
              <div className="mb-6">
                <Callout type="warning">
                  The full secret is shown <strong>only at creation time</strong>. If you lose it, rotate the secret from the Webhooks page — the old secret is invalidated immediately.
                </Callout>
              </div>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Rotating a secret</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Rotate your webhook secret if it is ever compromised or as part of regular key hygiene. The endpoint generates a new secret and invalidates the previous one immediately.
              </p>
              <CodeBlock id="webhook-rotate" lang="bash" code={`curl -X POST https://wisopay.io/admin/portal/webhooks/{id}/rotate-secret \\
  -H "Authorization: Bearer <portal_jwt>"`} />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-3">Rotation response</h3>
              <CodeBlock id="webhook-rotate-response" lang="json" code={`{
  "secret": "whsec_newKeyValue...",
  "secret_prefix": "whsec_newKeyVa...",
  "rotatedAt": "2026-08-26T12:00:00.000Z"
}`} />
              <div className="mt-4 mb-8">
                <Callout type="tip">
                  Update your server with the new secret <strong>before</strong> rotating — the old secret stops working the moment rotation completes.
                </Callout>
              </div>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Verifying signatures</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Each webhook includes an <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">X-Delivio-Signature</code> header — HMAC-SHA256 of the raw request body signed with your webhook secret.
                Always verify this before processing.
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

// Express handler:
app.post('/webhooks/deliviopay', express.raw({ type: '*/*' }), (req, res) => {
  const sig = req.headers['x-delivio-signature']
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(400).send('Invalid signature')
  }
  const { event, data } = JSON.parse(req.body)
  if (event === 'payment.completed') {
    // fulfil the order
  }
  res.sendStatus(200)
})`} />
            </section>

            {/* ── Errors ── */}
            <section id="errors" className="pb-16">
              <SectionHeading icon={<AlertCircle size={17} className="text-gray-600" />}>
                Errors
              </SectionHeading>
              <p className="text-gray-500 leading-relaxed mb-5">
                All errors return a JSON body with an <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">error</code> object containing a machine-readable <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">code</code> and a human-readable <code className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-xs">message</code>.
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
              <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden bg-white">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">HTTP status codes</span>
                </div>
                {([
                  ['400', 'warning', 'Bad Request — validation_error or missing required fields'],
                  ['401', 'error',   'Unauthorized — invalid or missing API key'],
                  ['404', 'neutral', 'Not Found — payment ID does not exist in this environment'],
                  ['409', 'warning', 'Conflict — duplicate merchant_reference'],
                  ['429', 'warning', 'Rate Limited — too many requests'],
                  ['500', 'error',   'Internal Error — contact support with your request_id'],
                ] as const).map(([code, variant, desc]) => (
                  <div key={code} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5 border-b border-gray-100 last:border-0">
                    <div className="sm:w-14 flex-shrink-0"><StatusBadge text={code} variant={variant} /></div>
                    <span className="text-sm text-gray-500">{desc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Callout type="info">
                  Questions or integration issues? Email <a href="mailto:support@deliviosend.com" className="font-semibold underline underline-offset-2">support@deliviosend.com</a> with your <code className="font-mono text-xs bg-blue-100 px-1 rounded">request_id</code> and we'll help you out.
                </Callout>
              </div>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  )
}
