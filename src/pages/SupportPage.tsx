import { Layout } from '../components/Layout'
import { Mail, MessageSquare, BookOpen, ExternalLink, Zap, AlertCircle, FileText } from 'lucide-react'

const FAQ = [
  {
    q: 'How long do USSD payment prompts stay active?',
    a: 'USSD sessions stay active for about 3–5 minutes. If the customer doesn\'t respond, the payment moves to FAILED and you can retry.',
  },
  {
    q: 'Can I issue a partial refund?',
    a: 'Yes. When refunding via the API or the payment detail page, pass an amount_minor less than the original. Partial refunds are supported.',
  },
  {
    q: 'How do webhooks retry on failure?',
    a: 'Failed webhooks retry up to 5 times with exponential backoff (30s, 2m, 10m, 1h, 6h). Check the Webhook Logs tab for delivery history.',
  },
  {
    q: 'What currencies are supported?',
    a: 'Currently TZS (Tanzanian Shilling) is supported for mobile money payments via Vodacom M-Pesa, Airtel Money, and Tigo Pesa.',
  },
  {
    q: 'How do I get my live API key?',
    a: 'Go to API Keys in the sidebar and rotate your production key. Live keys start with dpay_live_. Keep them secret — never expose them client-side.',
  },
  {
    q: 'Is there a sandbox / test mode?',
    a: 'Yes. Toggle the environment selector at the top of the sidebar to Sandbox. Sandbox payments complete immediately and trigger webhooks without sending real USSD pushes.',
  },
]

export function SupportPage() {
  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <h1 className="text-base font-bold text-gray-900">Support & Help</h1>
        <p className="text-xs text-gray-400">Get help with your integration</p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Mail, label: 'Email Support', desc: 'support@delivio.app', action: 'mailto:support@delivio.app',
              color: 'bg-blue-50', iconColor: 'text-blue-600',
            },
            {
              icon: MessageSquare, label: 'WhatsApp', desc: '+255 tba', action: undefined,
              color: 'bg-emerald-50', iconColor: 'text-emerald-600',
            },
            {
              icon: BookOpen, label: 'API Docs', desc: 'Full reference', action: '/docs',
              color: 'bg-violet-50', iconColor: 'text-violet-600',
            },
          ].map(({ icon: Icon, label, desc, action, color, iconColor }) => (
            <a
              key={label}
              href={action || '#'}
              className={`block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow ${action ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
            >
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon size={16} className={iconColor} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </a>
          ))}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Resources</p>
          <div className="space-y-2">
            {[
              { icon: Zap, label: 'Getting Started Guide', desc: 'Set up your first integration in minutes', href: '/docs' },
              { icon: FileText, label: 'Webhook Reference', desc: 'Event types, payloads, and retry logic', href: '/webhooks' },
              { icon: AlertCircle, label: 'API Status Page', desc: 'Real-time uptime and incident reports', href: undefined },
            ].map(({ icon: Icon, label, desc, href }) => (
              <a
                key={label}
                href={href || '#'}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group ${!href ? 'opacity-60 cursor-default' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                  <Icon size={14} className="text-gray-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                {href && <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />}
                {!href && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">SOON</span>}
              </a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Frequently Asked Questions</p>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className={`pb-4 ${i < FAQ.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <p className="text-sm font-semibold text-gray-800 mb-1">{item.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">Response times: email within 24h on weekdays · WhatsApp typically within 2h during business hours</p>
        </div>
      </div>
    </Layout>
  )
}
