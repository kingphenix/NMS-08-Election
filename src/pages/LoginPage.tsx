import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CountdownTimer from '../components/CountdownTimer'
import { loginWithToken } from '../lib/api'
import { setSession } from '../lib/session'
import logo from '../assets/nms-new-logo.webp'

import { supabaseUrl, supabaseAnonKey } from '../lib/supabase'

type LoginState = 'idle' | 'loading' | 'error'
type ErrorCode = 'INVALID_TOKEN' | 'ALREADY_USED' | 'RATE_LIMITED' | 'ALREADY_VOTED' | 'NETWORK' | 'NOT_STARTED' | 'ENDED'

const START_TIME = new Date('2026-09-12T10:00:00').getTime()
const END_TIME = new Date('2026-09-12T23:59:00').getTime()

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_TOKEN:  'Invalid credential. Please double-check your token and try again.',
  ALREADY_USED:   'This credential has already been used to log in.',
  RATE_LIMITED:   'Too many failed attempts. Please wait 15 minutes and try again.',
  ALREADY_VOTED:  'Your vote has already been recorded with this credential.',
  NETWORK:        'Connection error. Please check your internet and try again.',
  NOT_STARTED:    'Voting has not started yet. Please return at 10:00 AM on Saturday.',
  ENDED:          'Voting has ended. Thank you for your interest.',
}

/** Formats raw alphanumeric input into XXXX-XXXX-XXXX-XXXX */
function formatToken(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const groups = []
  for (let i = 0; i < clean.length && i < 16; i += 4) {
    groups.push(clean.slice(i, i + 4))
  }
  return groups.join('-')
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [tokenDisplay, setTokenDisplay] = useState('')
  const [state, setState] = useState<LoginState>('idle')
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)
  const [customError, setCustomError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(() => new Date().getTime() >= START_TIME)
  const [hasEnded, setHasEnded] = useState(() => new Date().getTime() >= END_TIME)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      setHasStarted(now >= START_TIME)
      setHasEnded(now >= END_TIME)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const rawToken = tokenDisplay.replace(/-/g, '')
  const isComplete = rawToken.length >= 15 && rawToken.length <= 16

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatToken(e.target.value)
    setTokenDisplay(formatted)
    if (state === 'error') {
      setState('idle')
      setErrorCode(null)
      setCustomError(null)
    }
  }, [state])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isComplete && hasStarted && !hasEnded) handleSubmit()
  }

  const handleSubmit = async () => {
    if (!isComplete || state === 'loading' || !hasStarted) return

    if (hasEnded) {
      setState('error')
      setErrorCode('ENDED')
      setCustomError(null)
      return
    }

    setState('loading')
    setErrorCode(null)
    setCustomError(null)

    try {
      const result = await loginWithToken(rawToken)

      if (result.has_voted) {
        setState('error')
        setErrorCode('ALREADY_VOTED')
        setCustomError(null)
        return
      }

      setSession(result.credential_id)
      navigate('/vote', { replace: true })
    } catch (err: unknown) {
      setState('error')
      const errObj = err as Record<string, string>
      const code = errObj.code as ErrorCode
      if (ERROR_MESSAGES[code]) {
        setErrorCode(code)
        setCustomError(null)
      } else {
        setErrorCode('NETWORK')
        setCustomError(errObj.message || 'Connection error. Please check your internet and try again.')
      }
    }
  }

  return (
    <>
      <CountdownTimer />
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-8) 0',
        borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
        background: '#064e3b',
        position: 'relative',
        zIndex: 10
      }}>
        <img
          src={logo}
          alt="NMS Logo"
          style={{ height: '56px', width: 'auto', marginRight: 'var(--sp-3)', objectFit: 'contain', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />
        <h1
          style={{ fontSize: '2.25rem', margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          NMS 08 Election
        </h1>
      </div>

      <div className="page-center" style={{ minHeight: 'calc(100dvh - 200px)' }}>
        <motion.div
          className="max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
        {(!supabaseUrl || !supabaseAnonKey) && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--sp-4)' }}>
            <span>⚠️</span>
            <span>
              Supabase environment variables are missing! Make sure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> are set in Vercel Environment Variables.
            </span>
          </div>
        )}

        <div className="text-center" style={{ marginBottom: 'var(--sp-6)' }}>
          <p className="text-muted">Enter your unique credential token to begin voting.</p>
        </div>


        {/* Card */}
        <div className="card card--lg">
          <div className="input-group">
            <label htmlFor="token-input" className="input-label">
              Your Voting Token
            </label>
            <input
              id="token-input"
              ref={inputRef}
              className="input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={tokenDisplay}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              maxLength={19} /* 16 chars + 3 dashes */
              disabled={state === 'loading' || !hasStarted || hasEnded}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.2rem',
                letterSpacing: '0.12em',
                textAlign: 'center',
                textTransform: 'uppercase',
                ...(state === 'error' ? { borderColor: 'var(--color-error)', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}),
              }}
            />
            <p className="text-xs text-subtle" style={{ textAlign: 'center' }}>
              Token format: XXXX-XXXX-XXXX-XXXX &nbsp;·&nbsp; From your mailed credential letter
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {state === 'error' && (errorCode || customError) && (
              <motion.div
                className="alert alert-error"
                style={{ marginTop: 'var(--sp-4)' }}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 'var(--sp-4)' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span>⚠️</span>
                <span>{customError || (errorCode ? ERROR_MESSAGES[errorCode] : 'An error occurred.')}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            id="login-submit-btn"
            className="btn btn-primary btn--full"
            style={{ marginTop: 'var(--sp-5)' }}
            onClick={handleSubmit}
            disabled={!isComplete || state === 'loading' || !hasStarted || hasEnded}
          >
            {state === 'loading' ? (
              <>
                <span className="spinner" />
                Verifying…
              </>
            ) : !hasStarted ? (
              <>
                <span>⏳</span>
                Voting Opens Saturday 10:00
              </>
            ) : hasEnded ? (
              <>
                <span>🔒</span>
                Voting Has Ended
              </>
            ) : (
              <>
                <span>🔐</span>
                Access Voting Booth
              </>
            )}
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-subtle" style={{ marginTop: 'var(--sp-5)' }}>
          <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 600, marginRight: '12px' }}>← View Manifesto</a>
          Having trouble? Contact your election administrator.{' '}
          <a href="/admin" style={{ color: 'var(--color-text-subtle)' }}>Admin →</a>
        </p>
      </motion.div>
      </div>
    </>
  )
}
