import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { clearSession } from '../lib/session'

export default function ConfirmationPage() {


  // Clear session on load so the credential can't be reused from this tab
  useEffect(() => {
    clearSession()
  }, [])

  return (
    <div className="page-center">
      <motion.div
        className="max-w-sm text-center"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 96, height: 96, borderRadius: 'var(--radius-xl)',
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(16,185,129,0.35)',
            fontSize: '3rem',
            marginBottom: 'var(--sp-6)',
            boxShadow: '0 0 40px rgba(16,185,129,0.15)',
          }}
        >
          ✅
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 style={{ color: 'var(--color-success)', marginBottom: 'var(--sp-3)' }}>
            Vote Recorded!
          </h1>
          <p className="text-muted" style={{ fontSize: '1.05rem', maxWidth: 320, margin: '0 auto' }}>
            Your ballot has been securely submitted. Thank you for participating in the NMS 08 election.
          </p>
        </motion.div>

        <motion.div
          className="card"
          style={{ marginTop: 'var(--sp-8)', textAlign: 'left' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex flex-col gap-3">
            {[
              { icon: '🔒', text: 'Your credential has been permanently invalidated.' },
              { icon: '🕵️', text: 'Your vote is anonymous — it cannot be linked to you.' },
              { icon: '📊', text: 'Results will be announced by the election administrator.' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
                <span className="text-sm text-muted">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-xs text-subtle"
          style={{ marginTop: 'var(--sp-6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          You may now close this window.
        </motion.p>
      </motion.div>
    </div>
  )
}
