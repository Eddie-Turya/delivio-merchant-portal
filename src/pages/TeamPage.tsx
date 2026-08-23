import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { Users, Plus, Trash2, X, Copy, Check, Shield, Eye } from 'lucide-react'

export function TeamPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('viewer')
  const [inviting, setInviting] = useState(false)
  const [newCred, setNewCred] = useState<{ email: string; tempPassword: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  const currentUser = JSON.parse(localStorage.getItem('portalMerchant') || '{}')

  const load = () => {
    setLoading(true)
    api.team().then(r => setMembers(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const invite = async () => {
    if (!email) { setErr('Email is required'); return }
    setInviting(true); setErr('')
    try {
      const res = await api.inviteTeamMember(email, name, role)
      setNewCred({ email: res.email, tempPassword: res.tempPassword })
      setShowForm(false); setEmail(''); setName(''); setRole('viewer')
      load()
    } catch (e: any) { setErr(e.message) }
    finally { setInviting(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this team member?')) return
    await api.removeTeamMember(id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">Team</h1>
          <p className="text-xs text-gray-400 hidden sm:block">Manage who has access to this merchant portal</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setErr('') }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex-shrink-0 min-h-[38px]">
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'Invite'}
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-2xl">
        {/* Temp password reveal */}
        {newCred && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-bold text-amber-800 mb-1">Invite created — share these credentials</p>
            <p className="text-xs text-amber-700 mb-3">This temporary password is shown only once. The member should change it after first login.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-400 text-xs w-16 flex-shrink-0">Email</span>
                <code className="flex-1 text-gray-800 text-xs">{newCred.email}</code>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm flex-1">
                  <span className="text-gray-400 text-xs w-16 flex-shrink-0">Password</span>
                  <code className="flex-1 text-gray-800 font-mono text-xs">{newCred.tempPassword}</code>
                </div>
                <button onClick={() => copy(`Email: ${newCred.email}\nPassword: ${newCred.tempPassword}`)}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-semibold flex-shrink-0">
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>
            <button onClick={() => setNewCred(null)} className="mt-3 text-xs text-amber-600 hover:text-amber-800">Dismiss</button>
          </div>
        )}

        {/* Invite form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Invite Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Full name (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[['admin', 'Admin', 'Full access, can invite members', Shield], ['viewer', 'Viewer', 'Read-only access to transactions', Eye]].map(([val, label, desc, Icon]: any) => (
                    <button key={val} type="button" onClick={() => setRole(val)}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-left transition ${role === val ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <Icon size={14} className={role === val ? 'text-emerald-600 mt-0.5' : 'text-gray-400 mt-0.5'} />
                      <div>
                        <p className={`text-xs font-semibold ${role === val ? 'text-emerald-700' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {err && <p className="text-xs text-red-500">{err}</p>}
              <button onClick={invite} disabled={inviting || !email}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                {inviting ? 'Inviting…' : 'Send Invite'}
              </button>
            </div>
          </div>
        )}

        {/* Member list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-16" />)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <Users size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{members.length} Member{members.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                      {(m.name || m.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.name || m.email}</p>
                      {m.name && <p className="text-xs text-gray-400 truncate">{m.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.role?.toUpperCase()}
                    </span>
                    {m.id !== currentUser?.id && (
                      <button onClick={() => remove(m.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
