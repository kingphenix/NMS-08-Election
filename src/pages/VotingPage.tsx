import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { submitBallot } from '../lib/api'
import type { BallotEntry } from '../lib/api'
import { getSession, clearSession } from '../lib/session'
import logo from '../assets/slogo@2x.png'

const TOTAL_VOTES = 6
const MAX_CANDIDATES = 3

interface Candidate {
  id: string
  name: string
}

interface Allocation {
  [candidateId: string]: number
}

export default function VotingPage() {
  const navigate = useNavigate()
  const session = getSession()

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [allocation, setAllocation] = useState<Allocation>({})
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const totalAllocated = Object.values(allocation).reduce((s, v) => s + v, 0)
  const remaining = TOTAL_VOTES - totalAllocated
  const isValid = selected.size >= 1 && totalAllocated === TOTAL_VOTES

  // Fetch candidates from Supabase (public read via RLS)
  useEffect(() => {
    supabase
      .from('candidates')
      .select('id, name')
      .then(({ data, error }) => {
        if (!error && data) setCandidates(data)
        setLoading(false)
      })
  }, [])

  const toggleCandidate = useCallback((id: string) => {
    setSelected(prev => {
      if (prev.has(id)) {
        // Deselect: remove allocation
        const next = new Set(prev)
        next.delete(id)
        setAllocation(a => {
          const n = { ...a }
          delete n[id]
          return n
        })
        return next
      }

      if (prev.size >= MAX_CANDIDATES) {
        // Shake the card to signal max reached
        setShakingId(id)
        setTimeout(() => setShakingId(null), 500)
        return prev
      }

      const next = new Set(prev)
      next.add(id)
      // Default allocation: 1 vote
      setAllocation(a => ({ ...a, [id]: 1 }))
      return next
    })
  }, [])

  const adjustVote = useCallback((candidateId: string, delta: number) => {
    setAllocation(prev => {
      const current = prev[candidateId] ?? 1
      const newVal = current + delta

      // Can't go below 1
      if (newVal < 1) return prev

      // Can't exceed remaining budget
      const otherTotal = Object.entries(prev)
        .filter(([id]) => id !== candidateId)
        .reduce((s, [, v]) => s + v, 0)

      if (otherTotal + newVal > TOTAL_VOTES) return prev

      return { ...prev, [candidateId]: newVal }
    })
  }, [])

  const handleSubmit = async () => {
    if (!isValid || submitting || !session) return
    setSubmitting(true)
    setSubmitError(null)

    const ballot: BallotEntry[] = Array.from(selected).map(id => ({
      candidate_id: id,
      votes_given: allocation[id] ?? 1,
    }))

    try {
      await submitBallot(session.credentialId, ballot)
      clearSession()
      navigate('/confirmation', { replace: true })
    } catch (err: unknown) {
      setSubmitting(false)
      const code = (err as Record<string, string>).code
      if (code === 'ALREADY_VOTED') {
        setSubmitError('Your vote has already been recorded.')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 'var(--sp-10)' }}>
      {/* Green hero banner — matches login page header */}
      <div style={{
        background: '#064e3b',
        padding: 'var(--sp-8) var(--sp-6)',
      }}>
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--sp-3)' }}>
              <img src={logo} alt="NMS Logo" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
              <h1 style={{ color: '#ffffff', margin: 0 }}>Cast Your Ballot</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              Select <strong style={{ color: '#ffffff' }}>1 to {MAX_CANDIDATES} candidates</strong> and
              distribute exactly <strong style={{ color: '#6ee7b7' }}>{TOTAL_VOTES} votes</strong> between them.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Divider line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #064e3b 0%, #10b981 50%, #064e3b 100%)' }} />

      {/* Main content */}
      <div style={{ padding: 'var(--sp-6) var(--sp-4)' }}>
        <div className="max-w-xl">

          {/* Vote Counter */}
          <motion.div
            className="card"
            style={{ marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ flex: 1 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-2)' }}>
                <span className="text-sm text-muted">Votes allocated</span>
                <motion.span
                  key={totalAllocated}
                  initial={{ scale: 1.3, color: 'var(--color-primary)' }}
                  animate={{ scale: 1, color: totalAllocated === TOTAL_VOTES ? 'var(--color-success)' : 'var(--color-text)' }}
                  style={{ fontSize: '1.5rem', fontWeight: 800 }}
                >
                  {totalAllocated} / {TOTAL_VOTES}
                </motion.span>
              </div>
              <div className="progress-bar-track">
                <motion.div
                  className="progress-bar-fill"
                  animate={{ width: `${(totalAllocated / TOTAL_VOTES) * 100}%` }}
                  style={{
                    background: totalAllocated === TOTAL_VOTES
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                  }}
                />
              </div>
            </div>
            {totalAllocated === TOTAL_VOTES ? (
              <div className="badge badge-success" style={{ fontSize: '1rem', padding: '6px 14px' }}>✓ Ready</div>
            ) : (
              <div className="badge badge-muted">
                {remaining > 0 ? `${remaining} left` : 'Over limit'}
              </div>
            )}
          </motion.div>

          {/* Max candidates warning */}
          <AnimatePresence>
            {selected.size === MAX_CANDIDATES && (
              <motion.div
                className="alert alert-warning"
                style={{ marginBottom: 'var(--sp-4)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>⚠️</span>
                <span>Maximum {MAX_CANDIDATES} candidates selected. Deselect one to choose another.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Candidate Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {candidates.map((candidate, i) => {
              const isSelected = selected.has(candidate.id)
              const votes = allocation[candidate.id] ?? 0
              const isShaking = shakingId === candidate.id

              return (
                <motion.div
                  key={candidate.id}
                  className={isShaking ? 'shake' : ''}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    onClick={() => toggleCandidate(candidate.id)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.08) 100%)'
                        : 'var(--color-surface)',
                      border: `1px solid ${isSelected ? 'rgba(139,92,246,0.5)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--sp-4)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-normal)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                      userSelect: 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 40, height: 40,
                          borderRadius: 'var(--radius-full)',
                          background: isSelected ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                          border: `2px solid ${isSelected ? 'transparent' : 'var(--color-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.875rem',
                          color: isSelected ? 'white' : 'var(--color-text-muted)',
                          flexShrink: 0,
                          transition: 'all var(--transition-normal)',
                        }}>
                          {isSelected ? '✓' : i + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>{candidate.name}</div>
                          {isSelected && (
                            <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                              {votes} vote{votes !== 1 ? 's' : ''} allocated
                            </div>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            className="stepper"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            <button
                              className="stepper-btn"
                              onClick={() => adjustVote(candidate.id, -1)}
                              disabled={votes <= 1}
                              aria-label={`Decrease votes for ${candidate.name}`}
                            >−</button>
                            <motion.span
                              key={votes}
                              className="stepper-value"
                              initial={{ scale: 1.4 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 600 }}
                            >
                              {votes}
                            </motion.span>
                            <button
                              className="stepper-btn"
                              onClick={() => adjustVote(candidate.id, 1)}
                              disabled={remaining <= 0}
                              aria-label={`Increase votes for ${candidate.name}`}
                            >+</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                className="alert alert-error"
                style={{ marginTop: 'var(--sp-6)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span>⚠️</span>
                <span>{submitError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button — always visible at the bottom */}
          <div style={{ marginTop: 'var(--sp-8)' }}>
            <button
              id="submit-ballot-btn"
              className="btn btn-primary btn--full"
              style={{ fontSize: '1rem', padding: '14px 24px' }}
              onClick={handleSubmit}
              disabled={!isValid || submitting}
            >
              {submitting ? (
                <><span className="spinner" />Submitting…</>
              ) : (
                'Submit My Votes'
              )}
            </button>
            {!isValid && (
              <p className="text-center text-xs text-subtle" style={{ marginTop: 'var(--sp-2)' }}>
                {selected.size === 0
                  ? 'Select at least one candidate to continue.'
                  : `Allocate all ${TOTAL_VOTES} votes to enable submission. ${remaining} remaining.`
                }
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
