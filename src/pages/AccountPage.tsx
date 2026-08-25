import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { api } from '../api'
import {
  User, Building2, Mail, KeyRound, Check, AlertCircle,
  Clock, Bell, BellOff, Lock, ShieldCheck, BadgeCheck, Upload, FileText, Landmark, Smartphone, XCircle,
} from 'lucide-react'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ icon: Icon, title, badge }: { icon: any; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-400" />
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      {badge}
    </div>
  )
}


const KYC_DOC_TYPES = [
  { type: 'IDENTITY', label: 'Identity Document', sub: 'National ID or Passport', icon: User },
  { type: 'BUSINESS_REG', label: 'Business Registration', sub: 'TIN or BRELA certificate', icon: FileText },
  { type: 'BANK_ACCOUNT', label: 'Bank Account', sub: 'Statement or letter', icon: Landmark },
  { type: 'MOBILE_MONEY', label: 'Mobile Money', sub: 'Registered business number', icon: Smartphone },
]

const NOTIF_OPTIONS = [
  { key: 'payment_completed', label: 'Payment completed', sub: 'Email when a customer pays', default: true },
  { key: 'payment_failed', label: 'Payment failed', sub: 'Email when a payment fails', default: true },
  { key: 'weekly_digest', label: 'Weekly digest', sub: 'Summary of transactions every Monday', default: false },
  { key: 'reconciliation_alerts', label: 'Reconciliation alerts', sub: 'When stuck payments are auto-resolved', default: false },
]

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

  const [notifs, setNotifs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIF_OPTIONS.map(o => [o.key, o.default]))
  )

  const [kyc, setKyc] = useState<Record<string, any>>({})
  const [kycLoading, setKycLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadMsg, setUploadMsg] = useState<{ type: string; ok: boolean; text: string } | null>(null)

  useEffect(() => {
    api.me().then((data: any) => {
      setProfile(data)
      setName(data.user?.name || '')
    }).catch(console.error).finally(() => setLoading(false))

    fetch('/admin/portal/kyc', { headers: { Authorization: `Bearer ${localStorage.getItem('portalToken')}` } })
      .then(r => r.json()).then(d => setKyc(d.documents || {}))
      .catch(console.error).finally(() => setKycLoading(false))
  }, [])

  const uploadKycDoc = async (type: string, file: File) => {
    setUploading(type); setUploadMsg(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`/admin/portal/kyc/upload/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('portalToken')}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setKyc(prev => ({ ...prev, [type]: { status: 'PENDING', uploaded_at: new Date().toISOString() } }))
      setUploadMsg({ type, ok: true, text: 'Document submitted for review' })
    } catch (err: any) {
      setUploadMsg({ type, ok: false, text: err.message })
    } finally { setUploading(null) }
  }

  const saveName = async () => {
    setSaving(true); setSaveMsg(null)
    try {
      await (api as any).updateMe({ name })
      setSaveMsg({ ok: true, text: 'Name updated' })
    } catch (err: any) {
      setSaveMsg({ ok: false, text: err.message })
    } finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: 'Passwords do not match' }); return }
    if (newPw.length < 8) { setPwMsg({ ok: false, text: 'At least 8 characters required' }); return }
    setPwSaving(true); setPwMsg(null)
    try {
      await (api as any).updateMe({ currentPassword: currentPw, newPassword: newPw })
      setPwMsg({ ok: true, text: 'Password changed successfully' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message })
    } finally { setPwSaving(false) }
  }


  return (
    <Layout>
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <h1 className="text-base font-bold text-gray-900">Account</h1>
        <p className="text-xs text-gray-400 hidden sm:block">Manage your profile, verification, and security settings</p>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse h-40" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-5">

              {/* Business */}
              <Card>
                <CardHeader icon={Building2} title="Business" />
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
              </Card>

              {/* Profile */}
              <Card>
                <CardHeader icon={User} title="Profile" />
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
                  <button onClick={saveName} disabled={saving}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </Card>

              {/* Change password */}
              <Card>
                <CardHeader icon={KeyRound} title="Change Password" />
                <div className="space-y-3">
                  {[['Current password', currentPw, setCurrentPw], ['New password', newPw, setNewPw], ['Confirm new password', confirmPw, setConfirmPw]] .map(([label, val, set]: any, i) => (
                    <div key={i}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                      <input type="password" value={val} onChange={e => set(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400" />
                    </div>
                  ))}
                  {pwMsg && (
                    <div className={`flex items-center gap-2 text-xs font-medium ${pwMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                      {pwMsg.ok ? <Check size={14} /> : <AlertCircle size={14} />} {pwMsg.text}
                    </div>
                  )}
                  <button onClick={changePassword} disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                    className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    {pwSaving ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </Card>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5">


              {/* KYC Verification */}
              <Card>
                <CardHeader icon={ShieldCheck} title="KYC Verification"
                  badge={(() => {
                    const docs = KYC_DOC_TYPES.map(t => kyc[t.type])
                    const approved = docs.filter(d => d?.status === 'APPROVED').length
                    const total = KYC_DOC_TYPES.length
                    const allDone = approved === total
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${allDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {approved}/{total} Verified
                      </span>
                    )
                  })()}
                />
                {kycLoading ? (
                  <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}</div>
                ) : (
                  <div className="space-y-3">
                    {KYC_DOC_TYPES.map(({ type, label, sub, icon: Icon }) => {
                      const doc = kyc[type]
                      const status = doc?.status
                      return (
                        <div key={type} className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                          status === 'APPROVED' ? 'border-emerald-100 bg-emerald-50/40' :
                          status === 'REJECTED' ? 'border-red-100 bg-red-50/40' :
                          status === 'PENDING' ? 'border-amber-100 bg-amber-50/30' :
                          'border-gray-100 bg-gray-50/60'
                        }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            status === 'APPROVED' ? 'bg-emerald-100' : status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <Icon size={15} className={status === 'APPROVED' ? 'text-emerald-600' : status === 'REJECTED' ? 'text-red-500' : 'text-gray-400'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900">{label}</p>
                            <p className="text-[11px] text-gray-400">{doc?.status === 'REJECTED' && doc.notes ? doc.notes : sub}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {status === 'APPROVED' && <BadgeCheck size={16} className="text-emerald-500" />}
                            {status === 'REJECTED' && <XCircle size={15} className="text-red-400" />}
                            {status === 'PENDING' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">PENDING</span>}
                            {(!status || status === 'REJECTED') && (
                              <label className={`cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition ${uploading === type ? 'border-gray-200 text-gray-300' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'}`}>
                                {uploading === type ? '…' : <><Upload size={10} /> {status === 'REJECTED' ? 'Re-upload' : 'Upload'}</>}
                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" disabled={!!uploading}
                                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadKycDoc(type, f); e.target.value = '' }} />
                              </label>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {uploadMsg && (
                  <p className={`mt-3 text-xs font-medium ${uploadMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                    {uploadMsg.ok ? <Check size={12} className="inline mr-1" /> : <AlertCircle size={12} className="inline mr-1" />}
                    {uploadMsg.text}
                  </p>
                )}
              </Card>

              {/* Security */}
              <Card>
                <CardHeader icon={Lock} title="Security" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Two-Factor Authentication</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Add a second layer of security to your account</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">SOON</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Active Sessions</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">You're signed in on this device</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      1 active
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Last Login</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {profile?.user?.created_at
                          ? new Date(profile.user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Unknown'}
                      </p>
                    </div>
                    <Clock size={14} className="text-gray-300" />
                  </div>
                </div>
              </Card>

              {/* Notification preferences */}
              <Card>
                <CardHeader icon={Bell} title="Notifications" />
                <div className="space-y-2">
                  {NOTIF_OPTIONS.map(({ key, label, sub }) => (
                    <div key={key} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{label}</p>
                        <p className="text-[11px] text-gray-400">{sub}</p>
                      </div>
                      <button
                        onClick={() => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`flex-shrink-0 w-8 h-4.5 rounded-full relative transition-colors duration-200 focus:outline-none ${notifs[key] ? 'bg-emerald-500' : 'bg-gray-200'}`}
                        style={{ height: '18px', width: '32px' }}
                      >
                        <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all duration-200 ${notifs[key] ? 'left-[14px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <BellOff size={12} />
                  Notification emails are sent to {profile?.user?.email}
                </div>
              </Card>

            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
