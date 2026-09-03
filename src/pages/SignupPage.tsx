import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Zap, AlertCircle, ArrowLeft, Building2, User, Phone, CreditCard, Upload, FileCheck, X } from 'lucide-react'
import { api } from '../api'

export function SignupPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [businessName, setBusinessName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nida, setNida] = useState('')
  const [tinFile, setTinFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3
  const pwLabels = ['', 'Weak', 'Good', 'Strong']
  const pwColors = ['', 'bg-red-500', 'bg-amber-400', 'bg-emerald-500']

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setTinFile(f)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!tinFile) { setError('Please upload your TIN document'); return }
    setLoading(true)
    try {
      await api.register({
        business_name: businessName.trim(),
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        phone_number: phone.trim(),
        nida_number: nida.trim(),
        tin_document: tinFile,
      })
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
        <a href="https://wisopay.io" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </a>
        <a href="https://wisopay.io#pricing" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
          View plans
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Wisopay</p>
              <p className="text-xs text-slate-400">Merchant Portal</p>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm mb-6">Start accepting mobile money payments in minutes</p>

            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Business name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    required placeholder="Acme Traders Ltd" className={inputCls} />
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    required placeholder="Edwin Ashon" className={inputCls} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="you@business.com" className={inputCls} />
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    required placeholder="255712345678" className={inputCls} />
                </div>
              </div>

              {/* NIDA number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">NIDA number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" value={nida} onChange={e => setNida(e.target.value)}
                    required placeholder="19XXXXXXXXXXXXXXXXX" className={inputCls} />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Your National Identification Authority number</p>
              </div>

              {/* TIN document */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">TIN document <span className="text-red-400">*</span></label>
                <input ref={fileRef} type="file" accept="image/*,application/pdf"
                  onChange={handleFile} className="hidden" />
                {tinFile ? (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
                    <FileCheck size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-emerald-300 flex-1 truncate">{tinFile.name}</span>
                    <button type="button" onClick={() => { setTinFile(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="text-slate-400 hover:text-white transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center gap-3 bg-slate-800/60 border border-slate-700 border-dashed rounded-lg px-4 py-3 text-sm text-slate-400 hover:border-emerald-500/50 hover:text-slate-300 transition-colors">
                    <Upload size={16} className="flex-shrink-0" />
                    <span>Upload TIN certificate (JPG, PNG or PDF, max 10 MB)</span>
                  </button>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder="At least 8 characters" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColors[pwStrength] : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{pwLabels[pwStrength]}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input type={showPw ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="Repeat your password"
                    className={`${inputCls} ${confirmPassword && confirmPassword !== password ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20' : ''}`} />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500 leading-relaxed px-4">
            By creating an account you agree to our{' '}
            <a href="https://wisopay.io/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="https://wisopay.io/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
