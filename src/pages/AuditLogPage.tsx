import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Shield, RefreshCw } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
  REFUND: 'bg-violet-50 text-violet-700',
  KEY_ROTATE: 'bg-amber-50 text-amber-700',
  WEBHOOK_CREATE: 'bg-emerald-50 text-emerald-700',
  WEBHOOK_UPDATE: 'bg-blue-50 text-blue-700',
  WEBHOOK_DELETE: 'bg-red-50 text-red-600',
  TEAM_INVITE: 'bg-teal-50 text-teal-700',
  TEAM_REMOVE: 'bg-red-50 text-red-600',
  PROFILE_UPDATE: 'bg-gray-100 text-gray-600',
}

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] || 'bg-gray-100 text-gray-600'
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{action}</span>
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.auditLogs(100)
      .then((r: any) => setLogs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Shield size={16} className="text-emerald-500" /> Audit Log
          </h1>
          <p className="text-xs text-gray-400">Security and administrative actions</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition min-h-[38px]">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-16" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-14 text-center">
            <Shield size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No audit events yet</p>
            <p className="text-xs text-gray-400 mt-1">Administrative actions will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5"><ActionBadge action={log.action} /></td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{log.user_email}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs truncate font-mono">
                        {log.details && typeof log.details === 'object' ? JSON.stringify(log.details).slice(0, 60) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-400">{log.ip || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <ActionBadge action={log.action} />
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{log.user_email}</p>
                  {log.ip && <p className="text-[10px] font-mono text-gray-400 mt-0.5">IP: {log.ip}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
