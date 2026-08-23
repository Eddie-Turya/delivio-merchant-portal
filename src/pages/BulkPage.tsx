import { Layout } from '../components/Layout'
import { Rows3, Clock } from 'lucide-react'

export function BulkPage() {
  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900">Bulk Payments</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">COMING SOON</span>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block">Collect from hundreds of customers in one go</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-lg mx-auto mt-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Rows3 size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bulk collections are coming</h2>
          <p className="text-sm text-gray-500 mb-6">Upload a CSV of phone numbers and amounts, and we'll send USSD push requests to all of them — with a live progress tracker and per-row status.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
            {[
              { title: 'CSV Upload', desc: 'Phone, amount, description per row' },
              { title: 'Live Progress', desc: 'See which payments completed' },
              { title: 'Retry Failed', desc: 'One click to retry failed rows' },
              { title: 'Export Results', desc: 'Download full results as CSV' },
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
