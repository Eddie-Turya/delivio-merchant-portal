import { Layout } from '../components/Layout'
import { ArrowUpRight, Clock } from 'lucide-react'

export function DisbursementPage() {
  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900">Disbursement</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">COMING SOON</span>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block">Send money to mobile wallets and bank accounts</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-lg mx-auto mt-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <ArrowUpRight size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Disbursements are coming</h2>
          <p className="text-sm text-gray-500 mb-6">Send payments directly to your customers, employees, or suppliers — M-Pesa, Airtel, Mixx, and bank transfers from one dashboard.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
            {[
              { title: 'Mobile Money', desc: 'Send to M-Pesa, Airtel, Mixx' },
              { title: 'Bank Transfer', desc: 'Direct to any Tanzanian bank' },
              { title: 'Bulk Payouts', desc: 'Upload CSV, pay thousands at once' },
              { title: 'Scheduled', desc: 'Set up recurring disbursements' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{f.title}</p>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock size={13} />
            <span>Expected Q4 2026 — we'll notify you when it's ready</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}
