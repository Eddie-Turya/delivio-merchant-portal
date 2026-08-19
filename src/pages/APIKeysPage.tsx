import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Key, Copy, Check, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export function APIKeysPage() {
  const [envs, setEnvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rotating, setRotating] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<{ envId: string; key: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    api.apiKeys()
      .then(res => setEnvs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const rotate = async (envId: string) => {
    if (!confirm('Rotating the key will immediately invalidate the current key. Continue?')) return
    setRotating(envId)
    try {
      const res = await api.rotateKey(envId)
      setNewKey({ envId, key: res.apiKey })
      setShowKey(false)
      setEnvs(prev => prev.map(e => e.id === envId ? { ...e, api_key_prefix: res.prefix } : e))
    } catch (err: any) {
      alert(err.message)
    } finally {
      setRotating(null)
    }
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-base font-bold text-gray-900">API Keys</h1>
        <p className="text-xs text-gray-400">Manage your API credentials for each environment</p>
      </div>

      <div className="p-6 space-y-5">
        {/* New key reveal */}
        {newKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 mb-1">New API key generated — copy it now</p>
                <p className="text-xs text-amber-700 mb-3">This key won't be shown again. Store it securely.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 overflow-x-auto">
                    {showKey ? newKey.key : newKey.key.slice(0, 12) + '•'.repeat(24)}
                  </code>
                  <button onClick={() => setShowKey(!showKey)} className="text-amber-600 hover:text-amber-800 p-1.5 transition">
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => copy(newKey.key)} className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition">
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          Use your API key in the <code className="font-mono bg-blue-100 px-1 rounded">Authorization: Bearer &lt;key&gt;</code> header with every API request.
        </div>

        {/* Environment cards */}
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
          ))
        ) : envs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Key size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No environments found</p>
          </div>
        ) : (
          envs.map(env => (
            <div key={env.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 capitalize">{env.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      env.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {env.enabled ? 'Active' : 'Inactive'}
                    </span>
                    {env.name === 'production' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-600">Live</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Environment ID: <code className="font-mono">{env.id}</code></p>
                </div>
                <button
                  onClick={() => rotate(env.id)}
                  disabled={rotating === env.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                >
                  <RefreshCw size={14} className={rotating === env.id ? 'animate-spin' : ''} />
                  Rotate Key
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Current API Key Prefix</p>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  <Key size={14} className="text-gray-400 flex-shrink-0" />
                  <code className="text-sm font-mono text-gray-700 flex-1">
                    {env.api_key_prefix}{'•'.repeat(32)}
                  </code>
                </div>
                <p className="text-xs text-gray-400 mt-2">Full key is hidden for security. Rotate to generate a new one.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex gap-4">
                <span>Created: {new Date(env.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(env.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}
