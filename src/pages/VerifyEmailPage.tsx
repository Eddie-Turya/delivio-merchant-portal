import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Zap, AlertCircle, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import { api } from '../api'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') || ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const otp = digits.join('')

  const handleChange = (idx: number, val: string) => {
    const ch = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = ch
    setDigits(next)
    setError('')
    if (ch && idx < 5) inputs.current[idx + 1]?.focus()
    if (next.every(d => d !== '')) submitOtp(next.join(''))
  }

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    const next = ['', '', '', '', '', '']
    text.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputs.current[Math.min(text.length, 5)]?.focus()
    if (text.length === 6) submitOtp(text)
  }

  const submitOtp = async (code: string) => {
    if (code.length !== 6 || !email) return
    setError('')
    setLoading(true)
    try {
      const data = await api.verifyEmail(email, code)
      localStorage.setItem('portalMerchant', JSON.stringify(data.merchant))
      if (data.user) localStorage.setItem('portalUser', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submitOtp(otp)
  }

  const handleResend = async () => {
    setResending(true)
    setResent(false)
    setError('')
    try {
      await api.resendOtp(email)
      setResent(true)
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } catch {
      // always show success (enumeration protection)
      setResent(true)
    } finally {
      setResending(false)
    }
  }

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1…$2')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
        <Link to="/signup" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
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

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={26} className="text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Check your email</h2>
            <p className="text-slate-400 text-sm mb-1">We sent a 6-digit code to</p>
            <p className="text-emerald-400 text-sm font-medium mb-6">{maskedEmail || 'your email'}</p>

            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 text-left">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {resent && (
              <div className="mb-5 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-400 text-left">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                New code sent — check your inbox
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* OTP inputs */}
              <div className="flex gap-3 justify-center mb-6">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={loading}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 text-center text-xl font-bold rounded-xl border bg-slate-800/60 text-white transition focus:outline-none
                      ${d ? 'border-emerald-500/70 bg-slate-800' : 'border-slate-700'}
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20'}
                      ${error ? 'border-red-500/50' : ''}
                    `}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition"
              >
                {loading ? 'Verifying…' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-400">
              <span>Didn't get the code?</span>
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <RotateCcw size={13} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Resend'
                )}
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Wrong email?{' '}
            <Link to="/signup" className="text-slate-400 hover:text-white transition-colors">
              Go back and try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
