import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { api } from '../api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2FA state
  const [requires2fa, setRequires2fa] = useState(false)
  const [partialToken, setPartialToken] = useState('')
  const [totpCode, setTotpCode] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(email, password)
      if (data.requires_2fa) {
        setPartialToken(data.partial_token)
        setRequires2fa(true)
        setLoading(false)
        return
      }
      localStorage.setItem('portalMerchant', JSON.stringify(data.merchant))
      localStorage.setItem('portalUser', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('portalLogin'))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handle2fa = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.verify2fa(partialToken, totpCode)
      localStorage.setItem('portalMerchant', JSON.stringify(data.merchant))
      localStorage.setItem('portalUser', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('portalLogin'))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || '2FA verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
        <a href="https://wisopay.io" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to home
        </a>
        <a href="https://wisopay.io#pricing" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">View plans</a>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 justify-center mb-8">
            <img src="/logo.png" alt="Wisopay" className="w-10 h-10 rounded-xl shadow-lg" />
            <div>
              <p className="text-lg font-bold text-white leading-tight">Wisopay</p>
              <p className="text-xs text-slate-400">Merchant Portal</p>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {requires2fa ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Two-factor auth</h2>
                    <p className="text-slate-400 text-xs">Enter the code from your authenticator app</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={15} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handle2fa} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">6-digit code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-2xl text-center tracking-[0.5em] placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
                    />
                  </div>
                  <button type="submit" disabled={loading || totpCode.length !== 6}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition">
                    {loading ? 'Verifying…' : 'Verify & Sign In'}
                  </button>
                  <button type="button" onClick={() => { setRequires2fa(false); setError(''); setTotpCode('') }}
                    className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition">
                    ← Back to login
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-slate-400 text-sm mb-6">Sign in to manage your account</p>

                {error && (
                  <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                    <AlertCircle size={15} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="you@merchant.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition" />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors">
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition">
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Sign up</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
