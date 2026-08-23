import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import { User, Building2, Mail, KeyRound, Check, AlertCircle } from 'lucide-react'

export function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    api.me().then((data: any) => {
      setProfile(data)
      setName(data.user?.name || '')
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const saveName = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await (api as any).updateMe({ name })
      setSaveMsg({ ok: true, text: 'Name updated' })
    } catch (err: any) {
      setSaveMsg({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: 'Passwords do not match' }); return }
    if (newPw.length < 8) { setPwMsg({ ok: false, text: 'Password must be at least 8 characters' }); return }
    setPwSaving(true)
    setPwMsg(null)
    try {
      await (api as any).updateMe({ currentPassword: currentPw, newPassword: newPw })
      setPwMsg({ ok: true, text: 'Password changed successfully' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <h1 className="text-base font-bold text-gray-900">Account</h1>
        <p className="text-xs text-gray-400 hidden sm:block">Manage your profile and security settings</p>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-xl">
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse h-32" />)}
          </div>
        ) : (
          <>
            {/* Business info (read-only) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Business</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Merchant Name</p>
                  <p className="text-sm text-gray-900 font-medium">{profile?.merchant?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Slug</p>
                  <p className="text-sm font-mono text-gray-600">{profile?.merchant?.slug || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {profile?.merchant?.status || 'active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Profile</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                    <Mail size={14} className="text-gray-400" />
                    <p className="text-sm text-gray-600">{profile?.user?.email || '—'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
                    placeholder="Your name"
                  />
                </div>
                {saveMsg && (
                  <div className={`flex items-center gap-2 text-xs font-medium ${saveMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                    {saveMsg.ok ? <Check size={14} /> : <AlertCircle size={14} />} {saveMsg.text}
                  </div>
                )}
                <button
                  onClick={saveName}
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={16} className="text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
              </div>
              <div className="space-y-3">
                {(['Current password', 'New password', 'Confirm new password'] as const).map((label, i) => (
                  <div key={i}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      type="password"
                      value={i === 0 ? currentPw : i === 1 ? newPw : confirmPw}
                      onChange={e => { if (i === 0) setCurrentPw(e.target.value); else if (i === 1) setNewPw(e.target.value); else setConfirmPw(e.target.value) }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                ))}
                {pwMsg && (
                  <div className={`flex items-center gap-2 text-xs font-medium ${pwMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                    {pwMsg.ok ? <Check size={14} /> : <AlertCircle size={14} />} {pwMsg.text}
                  </div>
                )}
                <button
                  onClick={changePassword}
                  disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                  className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
